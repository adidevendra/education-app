import { describe, it, expect } from 'vitest';
import { UserSchema } from './index';

describe('UserSchema', () => {
  it('should validate a correct user', () => {
    const user = { id: '1', name: 'Test', email: 'test@example.com' };
    expect(UserSchema.safeParse(user).success).toBe(true);
  });

  it('should fail for invalid email', () => {
    const user = { id: '1', name: 'Test', email: 'not-an-email' };
    expect(UserSchema.safeParse(user).success).toBe(false);
  });
});
