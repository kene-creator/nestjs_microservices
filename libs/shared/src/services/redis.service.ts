import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export default class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get(key: string) {
    console.log(`get ${key}`);
    return await this.cache.get(key);
  }

  async set(key: string, value: unknown, ttl = 0) {
    console.log(`set ${key}`);
    return await this.cache.set(key, value, ttl);
  }

  async del(key: string) {
    console.log(`del ${key}`);
    return await this.cache.del(key);
  }

  async reset() {
    console.log('reset cache');
    return await this.cache.reset();
  }
}
