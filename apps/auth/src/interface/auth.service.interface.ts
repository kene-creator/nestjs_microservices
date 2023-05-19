import { UserEntity } from '@app/shared';
import { ExistingUserDto } from '../dto/existing-user.dto';
import { NewUserDto } from '../dto/new-user.dto';

export interface AuthServiceInterface {
  getUsers(): Promise<UserEntity[]>;
  getUserByEmail(email: string): Promise<UserEntity>;
  hashPassword(password: string): Promise<string>;
  register(newUser: Readonly<NewUserDto>): Promise<UserEntity>;
  login(existingUser: Readonly<ExistingUserDto>);
  verifyJwt(jwt: string): Promise<{ exp: number }>;
  comparePasswords(password: string, hashedPassword: string): Promise<boolean>;
  getToken(userId: number, email: string): Promise<string>;
  validateUser(email: string, password: string): Promise<UserEntity>;
}
