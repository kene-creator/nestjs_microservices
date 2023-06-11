import { UserEntity } from '@app/shared';
import { ConversationsRepositoryInterface } from '@app/shared/interface/conversation.repository.interface';
import { MessagesRepositoryInterface } from '@app/shared/interface/message.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NewMessageDto } from './dto/NewMessageDto';

@Injectable()
export class ChatService {
  constructor(
    @Inject('ConversationsRepositoryInterface')
    private readonly conversationsRepository: ConversationsRepositoryInterface,
    @Inject('MessagesRepositoryInterface')
    private readonly messagesRepository: MessagesRepositoryInterface,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  private async getUser(id: number) {
    const ob$ = this.authService.send<UserEntity>(
      {
        cmd: 'get-user',
      },
      { id },
    );

    const user = await firstValueFrom(ob$).catch((err) => console.error(err));

    return user;
  }

  async getConversations(userId: number) {
    const allConversations =
      await this.conversationsRepository.findWithRelations({
        relations: ['users'],
      });

    const userConversations = allConversations.filter((conversation) => {
      const userIds = conversation.users.map((user) => user.id);
      return userIds.includes(userId);
    });

    return userConversations.map((conversation) => ({
      id: conversation.id,
      userIds: (conversation?.users ?? []).map((user) => user.id),
    }));
  }

  async createConversation(userId: number, friendId: number) {
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);

    if (!user || !friend) return;

    const conversation = await this.conversationsRepository.findConversation(
      userId,
      friendId,
    );

    if (!conversation) {
      return await this.conversationsRepository.save({
        users: [user, friend],
      });
    }

    return conversation;
  }

  async createMessage(userId: number, newMessage: NewMessageDto) {
    const user = await this.getUser(userId);

    if (!user) return;

    const conversation = await this.conversationsRepository.findByCondition({
      where: [{ id: newMessage.conversationId }],
      relations: ['users'],
    });

    if (!conversation) return;

    return await this.messagesRepository.save({
      message: newMessage.message,
      user,
      conversation,
    });
  }
}
