import { Controller, UseInterceptors } from '@nestjs/common';
import { PresenceService } from './presence.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { CacheInterceptor } from '@nestjs/cache-manager';
import RedisService from '@app/shared/services/redis.service';

@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly sharedService: SharedService,
    private readonly redisService: RedisService,
  ) {}

  @MessagePattern({ cmd: 'get-presence' })
  @UseInterceptors(CacheInterceptor)
  async getFoo(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    const foo = await this.redisService.get('foo');
    if (foo) {
      console.log('foo from cache');
      return foo;
    }

    const f = await this.presenceService.getFoo();
    this.redisService.set('foo', f);

    return f;
  }

  @MessagePattern({ cmd: 'get-active-user' })
  async getActiveUser(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.presenceService.getActiveUser(payload.userId);
  }
}
