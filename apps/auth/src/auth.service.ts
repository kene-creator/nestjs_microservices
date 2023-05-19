import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { NewUserDto } from './dto/new-user.dto';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { ExistingUserDto } from './dto/existing-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepsitory: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async getUsers() {
    return await this.userRepsitory.find();
  }

  async verifyJwt(jwt: string) {
    if (!jwt) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(jwt, {
        secret: process.env.JWT_SECRET,
      });
      const { exp } = decoded;
      return { exp };
    } catch (error) {
      throw new UnauthorizedException('Invalid token for verify');
    }
  }

  async login(existingUser: Readonly<ExistingUserDto>) {
    const { email, password } = existingUser;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException(`Invalid credentials`);
    }

    const jwt = await this.getToken(user.id, email);

    return { token: jwt };
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
    return await this.userRepsitory.findOne({
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password'],
    });
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

  async getToken(userId: number, email: string) {
    const payload = { sub: userId, email };

    console.log(process.env.JWT_SECRET);
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: 5000,
    });

    return token;
  }
}
