import { UserEntity } from '@app/shared';
import { ExistingUserDto } from '../dto/existing-user.dto';
import { NewUserDto } from '../dto/new-user.dto';
import { UserJwt } from '@app/shared/interface/user-jwt.interface';
import { FriendRequestEntity } from '@app/shared/entities/friend-request.entity';

export interface AuthServiceInterface {
  getUsers(): Promise<UserEntity[]>;
  getUserByEmail(email: string): Promise<UserEntity>;
  hashPassword(password: string): Promise<string>;
  register(newUser: Readonly<NewUserDto>): Promise<UserEntity>;
  login(
    existingUser: Readonly<ExistingUserDto>,
  ): Promise<{ token: string; user: UserEntity }>;
  verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }>;
  comparePasswords(password: string, hashedPassword: string): Promise<boolean>;
  getToken(userId: number, email: string): Promise<string>;
  validateUser(email: string, password: string): Promise<UserEntity>;
  getUserFromHeader(jwt: string): Promise<UserJwt>;
  addFriend(userId: number, friendId: number): Promise<FriendRequestEntity>;
  getFriends(userId: number): Promise<FriendRequestEntity[]>;
}
