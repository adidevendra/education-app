import { describe, it, expect } from '@jest/globals';
import { LtiService } from './lti.service';

describe('LtiService', () => {
  const svc = new LtiService();

  it('creates and validates state/nonce', () => {
    const { state, nonce } = svc.createState();
    expect(state).toBeTruthy();
    expect(nonce).toBeTruthy();
    expect(() => svc.validateState(state, nonce)).not.toThrow();
  });

  it('rejects reuse of state', () => {
    const { state, nonce } = svc.createState();
    svc.validateState(state, nonce);
    expect(() => svc.validateState(state, nonce)).toThrow();
  });

  it('provides JWKS with kid', () => {
    const jwks = svc.getJwks();
    expect(jwks.keys[0].kid).toBeTruthy();
  });
});
