import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepsitory: Repository<UserEntity>,
  ) {}

  async getUsers() {
    return await this.userRepsitory.find();
  }

  async postUser() {
    return await this.userRepsitory.save({
      name: 'USERR',
    });
  }
}
