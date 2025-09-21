# Storage Transfer Service (STS) Utilities

This directory contains helper scripts for creating on-demand Storage Transfer Service jobs and enforcing a one-day TTL lifecycle on staging ML buckets.

## 1. Create Transfer Job

Script: `create_job.ts`

Manifest TSV format (no header):

```
gs://source-bucket/path/file1.mp4	file1.mp4
gs://another/path/file2.json	data/file2.json
```

Run (dry-run):

```
pnpm tsx infra/sts/create_job.ts --tsv gs://my-ingest/manifest.tsv --dest gs://myproj-us-central1-ml --dry-run
```

Run (real):

```
pnpm tsx infra/sts/create_job.ts --tsv gs://my-ingest/manifest.tsv --dest gs://myproj-us-central1-ml --description "Ingest PMC OA batch"
```

Verify:

```
gcloud transfer jobs list --filter="description:PMC OA"
```

### Required IAM

Service account: `service-<PROJECT_NUMBER>@gcp-sa-storagetransfer.iam.gserviceaccount.com`

Grant on source & destination buckets:
- `roles/storage.objectAdmin`

Operators creating jobs need:
- `roles/storagetransfer.user`

## 2. Lifecycle Rule (TTL=1 day)

Lifecycle file: `lifecycle-ml-buckets.json`

Apply to one or more buckets:

```
./infra/sts/apply_lifecycle.sh gs://myproj-us-central1-ml gs://myproj-eu-west1-ml
```

Confirm:

```
gcloud storage buckets describe gs://myproj-us-central1-ml --format="yaml:lifecycle"
```

Expected output snippet:

```
lifecycle:
  rule:
  - action:
      type: Delete
    condition:
      age: 1
```

Objects older than 24h will be auto-deleted, keeping staging ML buckets lean.

## Notes

- Overwrite behavior uses `destination_modification_time_before_source` to avoid unnecessary rewrites.
- Add `--dry-run` to inspect job command without executing.
- Extend manifest generation upstream (e.g., crawler) to batch large ingest sets.
