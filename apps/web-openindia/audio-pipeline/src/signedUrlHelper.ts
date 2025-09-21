import {Storage} from '@google-cloud/storage';

const storage = new Storage();

export async function generateSignedUrl(bucketName: string, filename: string, expiresInSeconds = 3600) {
  const file = storage.bucket(bucketName).file(filename);
  const [url] = await file.getSignedUrl({action: 'read', expires: Date.now() + expiresInSeconds * 1000} as any);
  return url;
}
