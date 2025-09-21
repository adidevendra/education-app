import {synthesizeSpeech, uploadToBucket} from './googleCloudTTS';
import {sanitizeFilename} from './utils';

export async function synthesizeSanitizeAndUpload(text: string, filename: string, makePublic = false) {
  const safe = sanitizeFilename(filename);
  const audio = await synthesizeSpeech(text);
  return uploadToBucket(audio, safe, undefined, makePublic);
}
