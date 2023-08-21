import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostgresDBModule, SharedModule, UserEntity } from '@app/shared';

import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { FriendRequestEntity } from '@app/shared/entities/friend-request.entity';
import { ConversationEntity } from '@app/shared/entities/conversation.entity';
import { MessageEntity } from '@app/shared/entities/message.entity';
import { RedisModule } from '@app/shared/modules/redis.module';
import { ConversationsRepository } from '@app/shared/repositories/conversation.repository';
import { MessagesRepository } from '@app/shared/repositories/message.repository';

@Module({
  imports: [
    PostgresDBModule,
    RedisModule,
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq(
      'PRESENCE_SERVICE',
      process.env.RABBITMQ_PRESENCE_QUEUE,
    ),
    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity,
      ConversationEntity,
      MessageEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    {
      provide: 'ConversationsRepository',
      useClass: ConversationsRepository,
    },
    {
      provide: 'MessagesRepository',
      useClass: MessagesRepository,
    },
  ],
})
export class ChatModule {}
