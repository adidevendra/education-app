import express from 'express';
import bodyParser from 'body-parser';
import {synthesizeAndUpload} from './googleCloudTTS';

const app = express();
app.use(bodyParser.json({limit: '1mb'}));

app.post('/synthesize', async (req, res) => {
  try {
    const {text, filename, makePublic = false, voice, languageCode} = req.body as any;
    if (!text || !filename) return res.status(400).json({error: 'text and filename are required'});
    const result = await synthesizeAndUpload(text, filename, {name: voice, languageCode}, {makePublic});
    res.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('synthesize error', err);
    res.status(500).json({error: (err as Error).message || 'internal'});
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Audio pipeline server listening on ${port}`);
});

export default app;
