import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('validate returns expected shape', async () => {
    process.env.JWT_SECRET = 'changeme';
    const strat = new JwtStrategy();
    const out = await strat.validate({ sub: 'u1', email: 'a@b.com' } as any);
    expect(out).toEqual({ userId: 'u1', email: 'a@b.com' });
  });
});
