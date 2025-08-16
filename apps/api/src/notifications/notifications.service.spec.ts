import { describe, it, expect, beforeEach } from '@jest/globals';
import { NotificationsService } from './notifications.service';

describe('NotificationsService (unit)', () => {
  let svc: NotificationsService;

  beforeEach(() => {
    svc = new NotificationsService();
  });

  it('notify resolves with ok true for generic channel', async () => {
    const res = await svc.notify('test', { foo: 'bar' });
    expect(res).toEqual({ ok: true });
  });

  it('sendEmail delegates to notify', async () => {
    const res = await svc.sendEmail('a@b.com', 'sub', 'body');
    expect(res).toEqual({ ok: true });
  });

  it('sendPush delegates to notify', async () => {
    const res = await svc.sendPush('dev1', 'hi', 'msg');
    expect(res).toEqual({ ok: true });
  });
});
