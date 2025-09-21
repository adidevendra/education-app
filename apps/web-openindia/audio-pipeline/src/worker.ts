import {synthesizeAndUpload} from './googleCloudTTS';

export async function processJob(job: {text: string; filename: string; makePublic?: boolean}) {
  return synthesizeAndUpload(job.text, job.filename, {}, {makePublic: job.makePublic});
}
