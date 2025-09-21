declare module 'web-push' {
  interface PushSubscription {
    endpoint: string;
    keys?: Record<string, string>;
  }

  interface SendResult {
    statusCode: number;
    body?: any;
  }

  function sendNotification(subscription: PushSubscription, payload?: string | Buffer, options?: Record<string, any>): Promise<SendResult>;
  function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;

  const webpush: {
    sendNotification: typeof sendNotification;
    setVapidDetails: typeof setVapidDetails;
  };

  export default webpush;
}
