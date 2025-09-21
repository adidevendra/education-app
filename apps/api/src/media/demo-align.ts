import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';

async function main() {
  const q = new Queue('align-audio', { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } });
  const assetId = process.argv[2] || `asset_${randomUUID()}`;
  const transcript = process.argv.slice(3).join(' ') || 'This is a demo transcript. It has a few sentences. Alignment will split them.';
  await q.add('force-align', { assetId, orgId: 'demo-org', wavPath: '/tmp/demo.wav', transcript });
  console.log('Enqueued alignment job for', assetId);
  process.exit(0);
}

main();
