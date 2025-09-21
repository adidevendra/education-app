import webpush from 'web-push';

export class WebPushAdapter {
  constructor(){
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const mailto = process.env.VAPID_MAILTO || 'mailto:admin@example.com';
    if (publicKey && privateKey) {
      webpush.setVapidDetails(mailto, publicKey, privateKey);
    }
  }
  async send(subscription: any, title: string, body: string){
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.log(`[webpush:mock] ${title}: ${body}`);
      return { ok: true, mock: true } as const;
    }
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    return { ok: true } as const;
  }
}
