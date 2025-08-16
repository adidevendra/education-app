import { describe, it, expect } from '@jest/globals';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  it('allows when no roles required', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined as any);
    const guard = new RolesGuard(reflector as any);
    const ctx: any = { getHandler: () => {}, getClass: () => {}, switchToHttp: () => ({ getRequest: () => ({}) }) };
    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('allows when user has role', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const guard = new RolesGuard(reflector as any);
    const ctx: any = { getHandler: () => {}, getClass: () => {}, switchToHttp: () => ({ getRequest: () => ({ user: { role: 'admin' } }) }) };
    expect(guard.canActivate(ctx as any)).toBe(true);
  });

  it('denies when user missing', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const guard = new RolesGuard(reflector as any);
    const ctx: any = { getHandler: () => {}, getClass: () => {}, switchToHttp: () => ({ getRequest: () => ({}) }) };
    expect(guard.canActivate(ctx as any)).toBe(false);
  });
});
