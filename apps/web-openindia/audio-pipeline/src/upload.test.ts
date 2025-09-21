import {uploadToBucket} from './googleCloudTTS';

describe('uploadToBucket', () => {
  it('throws when no bucket is configured', async () => {
    await expect(uploadToBucket(Buffer.from('x'), 'a.mp3', undefined, false)).rejects.toThrow();
  });
});
