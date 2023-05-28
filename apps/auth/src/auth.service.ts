import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserEntity } from './user.entity';
import { FindOneOptions } from 'typeorm';
import { NewUserDto } from './dto/new-user.dto';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { ExistingUserDto } from './dto/existing-user.dto';
import { UserRepositoryInterface } from '@app/shared/interface/users.repository.interface';
import { UserJwt } from '@app/shared/interface/user-jwt.interface';
import { FriendRequestEntity } from '@app/shared/entities/friend-request.entity';
import { FriendRequestsRepository } from '@app/shared/repositories/friend-request.repository';
import { UserRequest } from '@app/shared/interface/user-request.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepsitory: UserRepositoryInterface,
    @Inject('FriendRequestsRepositoryInterface')
    private readonly friendRequestsRepository: FriendRequestsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getUsers(): Promise<UserEntity[]> {
    return await this.userRepsitory.findAll();
  }

  async verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(jwt, {
        secret: process.env.JWT_SECRET,
      });
      const { user, exp } = decoded;
      return { user, exp };
    } catch (error) {
      throw new UnauthorizedException('Invalid token for verify');
    }
  }

  async login(
    existingUser: Readonly<ExistingUserDto>,
  ): Promise<{ token: string; user: UserEntity }> {
    const { email, password } = existingUser;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException(`Invalid credentials`);
    }

    delete user.password;
    const jwt = await this.getToken(user.id, email);

    return { token: jwt, user };
  }

  async register(newUser: Readonly<NewUserDto>): Promise<UserEntity> {
    const { email, firstName, lastName, password } = newUser;

    const existingUser = await this.getUserByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        `Already registered user with email ${email}`,
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const savedUser = await this.userRepsitory.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    delete savedUser.password;
    return savedUser;
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    const filterCondition: FindOneOptions<UserEntity> = {
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password'],
    };

    return await this.userRepsitory.findByCondition(filterCondition);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.getUserByEmail(email);

    const doesUserExist = !!user;

    if (!doesUserExist) return null;

    const isPasswordValid = await this.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) return null;

    return user;
  }

  async getUserFromHeader(jwt: string): Promise<UserRequest> {
    if (!jwt) return;

    try {
      const decoded = await this.jwtService.verifyAsync(jwt, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.findById(decoded.sub);
      return { user };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async addFriend(
    userId: number,
    friendId: number,
  ): Promise<FriendRequestEntity> {
    const creator = await this.findById(userId);
    const receiver = await this.findById(friendId);

    return await this.friendRequestsRepository.save({ creator, receiver });
  }

  async getFriends(userId: number): Promise<FriendRequestEntity[]> {
    const creator = await this.findById(userId);

    return await this.friendRequestsRepository.findWithRelations({
      where: [{ creator }, { receiver: creator }],
      relations: ['creator', 'receiver'],
    });
  }

  async getToken(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };

    console.log(process.env.JWT_SECRET);
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: 5000,
    });

    return token;
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepsitory.findOneById(id);
  }
}
