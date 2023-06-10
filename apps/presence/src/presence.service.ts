import { Injectable } from '@nestjs/common';
import { ActiveUser } from './interfaces/ActiveUser.interface';
import RedisService from '@app/shared/services/redis.service';

@Injectable()
export class PresenceService {
  constructor(private readonly cache: RedisService) {}
  getHello(): string {
    return 'Hello World!';
  }

  getFoo() {
    console.log('Not Cached');
    return { foo: 'bar' };
  }

  async getActiveUser(userId: number) {
    const user = await this.cache.get(`user ${userId}`);

    return user as ActiveUser | undefined;
  }
}
