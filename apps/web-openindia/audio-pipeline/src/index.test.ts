import {synthesizeSpeech} from './googleCloudTTS';

describe('synthesizeSpeech', () => {
  it('throws when called with empty text', async () => {
    await expect(synthesizeSpeech('')).rejects.toThrow();
  });
});
