import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionStrategy {
  async validate() {
    return null;
  }
}
