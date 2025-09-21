import {TextToSpeechClient, protos} from '@google-cloud/text-to-speech';
import {Storage, GetSignedUrlConfig} from '@google-cloud/storage';

export type SynthesizeOptions = {
  languageCode?: string; // e.g. 'en-US'
  name?: string; // voice name
  ssmlGender?: protos.google.cloud.texttospeech.v1.SsmlVoiceGender | keyof typeof protos.google.cloud.texttospeech.v1.SsmlVoiceGender;
  speakingRate?: number;
  pitch?: number;
  audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
};

const ttsClient = new TextToSpeechClient();
const storage = new Storage();

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function withRetries<T>(fn: () => Promise<T>, attempts = 3, baseDelay = 250) {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const delay = baseDelay * Math.pow(2, i);
      // eslint-disable-next-line no-console
      console.warn(`Attempt ${i + 1} failed, retrying after ${delay}ms:`, (err as Error).message || err);
      await sleep(delay);
    }
  }
  throw lastErr;
}

/**
 * Synthesize speech from text using Google Cloud Text-to-Speech.
 * Returns a Buffer with audio content.
 */
export async function synthesizeSpeech(text: string, opts: SynthesizeOptions = {}) {
  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: undefined as any,
    voice: {
      languageCode: opts.languageCode || process.env.TTS_LANGUAGE_CODE || 'en-US',
    },
    audioConfig: {
      audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding[opts.audioEncoding || (process.env.TTS_AUDIO_ENCODING as any) || 'MP3'],
      speakingRate: opts.speakingRate || 1.0,
      pitch: opts.pitch || 0,
    } as any,
  } as any;

  // Support plain text or SSML
  if (text.trim().startsWith('<')) {
    request.input = {ssml: text};
  } else {
    request.input = {text};
  }

  if (opts.name) request.voice.name = opts.name;
  if (opts.ssmlGender) request.voice.ssmlGender = opts.ssmlGender as any;

  const call = async () => {
    const [response] = await ttsClient.synthesizeSpeech(request);
    if (!response || !response.audioContent) {
      throw new Error('Text-to-Speech did not return audioContent');
    }
    return Buffer.from(response.audioContent as Buffer);
  };

  // Retry on transient network / API errors
  return await withRetries(call, 3, 300);
}

/**
 * Upload a Buffer to a Google Cloud Storage bucket.
 * Returns the gsPath and optional publicUrl and signedUrl for temporary access.
 */
export async function uploadToBucket(buffer: Buffer, filename: string, bucketName?: string, makePublic = false, generateSignedUrlForSeconds = 3600) {
  const targetBucket = bucketName || process.env.GCP_BUCKET_NAME;
  if (!targetBucket) throw new Error('GCP_BUCKET_NAME environment variable or bucketName parameter required');

  const bucket = storage.bucket(targetBucket);
  const file = bucket.file(filename);

  const upload = async () => {
    await file.save(buffer, {
      metadata: {
        contentType: 'audio/mpeg',
        metadata: {
          generatedBy: 'web-openindia-audio-pipeline',
        },
      },
      resumable: false,
    });
  };

  await withRetries(upload, 3, 300);

  if (makePublic) {
    await file.makePublic();
  }

  let signedUrl: string | null = null;
  try {
    const config: GetSignedUrlConfig = {
      action: 'read',
      expires: Date.now() + generateSignedUrlForSeconds * 1000,
    };
    const [url] = await file.getSignedUrl(config as any);
    signedUrl = url;
  } catch (err) {
    // ignore signed URL generation failures; it's optional
    // eslint-disable-next-line no-console
    console.warn('Signed URL generation failed:', (err as Error).message || err);
  }

  const publicUrl = makePublic ? `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(file.name)}` : null;
  return {gsPath: `gs://${bucket.name}/${file.name}`, publicUrl, signedUrl};
}

/**
 * Convenience: synthesize text and upload resulting audio to GCS.
 * Returns upload result.
 */
export async function synthesizeAndUpload(text: string, filename: string, opts: SynthesizeOptions = {}, uploadOpts?: {bucketName?: string; makePublic?: boolean; signedUrlTTL?: number}) {
  const buffer = await synthesizeSpeech(text, opts);
  const result = await uploadToBucket(buffer, filename, uploadOpts?.bucketName, uploadOpts?.makePublic || false, uploadOpts?.signedUrlTTL || 3600);
  return result;
}
