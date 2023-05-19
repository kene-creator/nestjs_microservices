import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule, PostgresDBModule } from '@app/shared';

import { UserEntity } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { JwtStrategy } from './jwt-strategy';
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
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard, JwtStrategy],
})
export class AuthModule {}
