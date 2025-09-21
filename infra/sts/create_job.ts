#!/usr/bin/env ts-node
/*
 * Storage Transfer Service (STS) convenience wrapper.
 * Usage:
 *   pnpm tsx infra/sts/create_job.ts --tsv gs://my-bucket/manifest.tsv --dest gs://target-bucket-us-central1-ml [--description "Ingest"] [--dry-run]
 * Manifest TSV format (no header): source_url <TAB> destination_path_relative
 * Requires: gcloud auth login & application default creds with roles/storage.admin + storagetransfer.admin
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

interface Args { tsv: string; dest: string; description?: string; dryRun?: boolean }

function parseArgs(): Args {
  const out: Partial<Args> = {};
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === '--tsv') out.tsv = process.argv[++i];
    else if (a === '--dest') out.dest = process.argv[++i];
    else if (a === '--description') out.description = process.argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
  }
  if (!out.tsv || !out.dest) {
    console.error('Missing required --tsv and/or --dest');
    process.exit(1);
  }
  return out as Args;
}

function ensureGcloud() {
  try { execSync('gcloud -v', { stdio: 'ignore' }); } catch { console.error('gcloud CLI not found in PATH'); process.exit(1); }
}

function validateManifest(tsv: string) {
  if (!existsSync(tsv)) {
    console.error(`Manifest file not found: ${tsv}`); process.exit(1);
  }
  const content = readFileSync(tsv, 'utf8').trim();
  if (!content) { console.error('Manifest TSV empty'); process.exit(1); }
  const lines = content.split(/\n+/);
  const invalid = lines.filter(l => !/^gs:\/\/.+?\t.+/.test(l));
  if (invalid.length) {
    console.error('Invalid TSV lines (must be: gs://source/path\trelativeDestPath):');
    invalid.forEach(l => console.error('  ' + l));
    process.exit(1);
  }
  return { lines, path: tsv };
}

function main() {
  const args = parseArgs();
  ensureGcloud();
  const manifest = validateManifest(args.tsv);
  const desc = args.description || `Transfer ${path.basename(args.tsv)}`;
  const jobCmd = [
    'gcloud transfer jobs create',
    `--source-manifest=${manifest.path}`,
    `--destination=${args.dest}`,
    `--description="${desc}"`,
    '--no-follow-symlinks',
    '--overwrite-when=destination_modification_time_before_source',
  ].join(' ');

  console.log('Manifest lines:', manifest.lines.length);
  console.log('Destination bucket:', args.dest);
  console.log('Description:', desc);
  if (args.dryRun) {
    console.log('[DRY RUN] Command that would execute:');
    console.log(jobCmd);
    process.exit(0);
  }
  console.log('Executing job creation...');
  try {
    const output = execSync(jobCmd, { stdio: 'pipe' }).toString();
    console.log(output);
    console.log('Job created. Verify with: gcloud transfer jobs list --filter="description:' + desc + '"');
  } catch (e: any) {
    console.error('Failed creating transfer job:', e.stderr?.toString() || e.message);
    process.exit(1);
  }

  console.log('\nIAM Hints:');
  console.log('- Ensure service account: service-<PROJECT_NUMBER>@gcp-sa-storagetransfer.iam.gserviceaccount.com has storage.objectAdmin on source & dest.');
  console.log('- Grant roles/storagetransfer.user to operators triggering jobs.');
}

main();
