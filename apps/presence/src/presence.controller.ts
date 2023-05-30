import { Controller, UseInterceptors } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
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
}
