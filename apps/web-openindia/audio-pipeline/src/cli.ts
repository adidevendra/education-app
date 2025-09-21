#!/usr/bin/env node
import {synthesizeAndUpload} from './googleCloudTTS';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node dist/cli.js "<text>" output-filename.mp3');
    process.exit(2);
  }
  const text = args[0];
  const filename = args[1];
  try {
    const res = await synthesizeAndUpload(text, filename, {}, {makePublic: true});
    console.log('Uploaded:', res);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

if (require.main === module) main();
