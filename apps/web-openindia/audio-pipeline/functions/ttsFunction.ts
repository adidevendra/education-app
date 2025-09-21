import {Request, Response} from 'express';
import {synthesizeAndUpload} from '../src/googleCloudTTS';

export async function ttsFunction(req: Request, res: Response) {
  try {
    const {text, filename, makePublic = false, voice, languageCode} = req.body as any;
    if (!text || !filename) return res.status(400).json({error: 'text and filename are required'});
    const result = await synthesizeAndUpload(text, filename, {name: voice, languageCode}, {makePublic});
    res.json(result);
  } catch (err) {
    console.error('ttsFunction error', err);
    res.status(500).json({error: (err as Error).message || 'internal'});
  }
}
