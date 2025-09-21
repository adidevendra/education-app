import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface LtiStateRecord { state: string; nonce: string; createdAt: number; }

@Injectable()
export class LtiService {
  private states = new Map<string, LtiStateRecord>();
  private keyPair = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  private kid = crypto.randomBytes(8).toString('hex');

  createState(): { state: string; nonce: string } {
    const state = crypto.randomBytes(16).toString('hex');
    const nonce = crypto.randomBytes(16).toString('hex');
    this.states.set(state, { state, nonce, createdAt: Date.now() });
    return { state, nonce };
  }

  validateState(state: string, nonce: string) {
    const rec = this.states.get(state);
    if (!rec) throw new UnauthorizedException('Invalid state');
    if (rec.nonce !== nonce) throw new UnauthorizedException('Invalid nonce');
    if (Date.now() - rec.createdAt > 5 * 60_000) throw new UnauthorizedException('State expired');
    this.states.delete(state); // one-time use
  }

  getJwks() {
    const pub = this.keyPair.publicKey.export({ format: 'jwk' }) as any;
    pub.kid = this.kid;
    pub.alg = 'RS256';
    pub.use = 'sig';
    return { keys: [pub] };
  }

  // Placeholder: platform launch validation would verify id_token signature & claims.
  handleLaunch(idToken: string) {
    if (!idToken) throw new UnauthorizedException('Missing id_token');
    // decode header to check kid (skipped for placeholder)
    return { ok: true, context: { resourceLinkId: 'demo-link', user: 'learner1' } };
  }

  // Stub grade return; in real case, POST to lineitem endpoint with score.
  async returnGrade(lineItemUrl: string, userId: string, score: number) {
    return { ok: true, lineItemUrl, userId, score };
  }
}
