import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  getHello(): string {
    return 'Hello World!';
  }

  getFoo() {
    console.log('Not Cached');
    return { foo: 'bar' };
  }
}
