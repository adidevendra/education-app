Deployment recommendations

- Use Workload Identity or a short-lived service account for Cloud Run. Avoid embedding service account keys in images.
- Grant the service account least-privilege roles: Storage Object Admin on the specific bucket, or a custom role that only allows object creation and signed URL generation.
- Use Cloud Run request authentication and IAM to restrict access.
- Consider a Pub/Sub + Cloud Run architecture to process jobs asynchronously and scale.
