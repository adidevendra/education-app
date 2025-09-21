# Audio Pipeline (Google Cloud)

This small module provides helpers to synthesize text to speech using Google Cloud Text-to-Speech and upload resulting audio files to a Google Cloud Storage bucket.

Environment variables

- `GOOGLE_APPLICATION_CREDENTIALS` - path to service account JSON key file, or use default ADC in your environment.
- `GCP_BUCKET_NAME` - the target Google Cloud Storage bucket name to upload audio files.
- `TTS_VOICE` - optional voice name (e.g. `en-US-Wavenet-D`).
- `TTS_LANGUAGE_CODE` - optional language code, default `en-US`.
- `TTS_AUDIO_ENCODING` - one of `MP3`, `LINEAR16`, `OGG_OPUS` (default `MP3`).

Quick start

1. From the `audio-pipeline` folder, install dependencies:

```bash
cd apps/web-openindia/audio-pipeline
npm install
```

2. Example usage (synthesize text and upload):

```bash
# Ensure GOOGLE_APPLICATION_CREDENTIALS is set and points to a valid service account key
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
export GCP_BUCKET_NAME=my-bucket-name
npm start -- "Hello OpenIndia" openindia-hello.mp3
```

This will synthesize speech and upload the file to `gs://my-bucket-name/openindia-hello.mp3` and make it publicly readable (the CLI sets makePublic=true).

Security

- Keep service account credentials secret. Prefer using Workload Identity / ADC on GCP when running from Cloud Run/Functions.

Notes

- This module is intentionally minimal. If you need voice cloning or more complex pipelines (neural vocoders, model orchestration), we can add orchestration for Cloud Functions / Cloud Run and job status tracking.
