import { Expo } from 'expo-server-sdk';

export class ExpoAdapter {
  private expo = new Expo();
  async send(token: string, title: string, body: string){
    if (!Expo.isExpoPushToken(token)) {
      console.warn('Invalid Expo token');
      return { ok: false } as const;
    }
    await this.expo.sendPushNotificationsAsync([{ to: token, sound: 'default', title, body }]);
    return { ok: true } as const;
  }
}
