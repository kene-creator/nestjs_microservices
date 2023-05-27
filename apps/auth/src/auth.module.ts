import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule, PostgresDBModule, SharedService } from '@app/shared';

import { UserEntity } from '@app/shared';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { JwtStrategy } from './jwt-strategy';
import { UserRepository } from '@app/shared/repositories/user.repository';
import { FriendRequestsRepository } from '@app/shared/repositories/friend-request.repository';
import { FriendRequestEntity } from '@app/shared/entities/friend-request.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    JwtModule.register({}),
    SharedModule,
    PostgresDBModule,
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //    useFactory: (configService: ConfigService) => ({
    //      type: 'postgres',
    //      url: configService.get('POSTGRES_URI'),
    //      autoLoadEntities: true,
    //      synchronize: true, //! WARNING: This option should never be used in production - otherwise you can lose production data.
    //    }),
    //   useFactory: (configService: ConfigService) => ({
    //     ...dataSourceOption,
    //     url: configService.get('POSTGRES_URI'),
    //     autoLoadEntities: true,
    //     synchronize: true, //! WARNING: This option should never be used in production - otherwise you can lose production data.
    //   }),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forFeature([UserEntity, FriendRequestEntity]),
  ],
  controllers: [AuthController],
  providers: [
    JwtGuard,
    JwtStrategy,
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'FriendRequestsRepositoryInterface',
      useClass: FriendRequestsRepository,
    },
  ],
})
export class AuthModule {}
