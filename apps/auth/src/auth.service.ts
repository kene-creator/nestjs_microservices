import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { NewUserDto } from './dto/new-user.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepsitory: Repository<UserEntity>,
  ) {}

  async getUsers() {
    return await this.userRepsitory.find();
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
}
