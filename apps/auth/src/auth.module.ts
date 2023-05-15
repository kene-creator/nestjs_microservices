import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { dataSource, dataSourceOption } from './db/data-source';
import { SharedModule } from '@app/shared';
import { PostgresDBModule } from '@app/shared/postgredb.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
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
  providers: [AuthService],
})
export class AuthModule {}
