import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  sign(payload: any) {
    return jwt.sign(payload, process.env.JWT_SECRET || 'changeme', { expiresIn: '15m' });
  }

  verify(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET || 'changeme');
  }
}
