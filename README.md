# CyberX Backblaze Manager

A mobile-friendly Backblaze B2 S3-compatible storage dashboard deployed as Vercel serverless functions.

## Features
- Password-protected admin dashboard; credentials remain server-side.
- Bucket listing, creation and deletion (B2 only allows deleting empty buckets).
- Object listing with pagination, search-by-prefix and file metadata.
- Browser-to-B2 presigned uploads (files are not proxied through the function).
- Presigned downloads, copy and delete.
- Object version listing.
- Responsive blue/white UI.
- Multipart uploads for large files (64 MiB chunks).
- Storage analytics across buckets (up to 1000 pages per bucket per run).
- Object version restore.
- Default bucket encryption configuration and Object Lock controls (where supported by the bucket/API).
- Per-object retention and legal-hold controls.
- Lifecycle expiration rule management.
- Restricted application-key list/create/revoke (requires separate master key credentials).
- Manual bucket-to-bucket backup and daily Vercel Cron backup.

## Deploy
1. Import this repository into Vercel.
2. Add environment variables:
   - `ADMIN_PASSWORD`: strong dashboard password.
   - `B2_KEY_ID`: Backblaze application key ID.
   - `B2_APPLICATION_KEY`: Backblaze application key secret.
   - `B2_ENDPOINT`: e.g. `https://s3.us-east-005.backblazeb2.com` (use your bucket's actual region).
   - `B2_REGION`: e.g. `us-east-005`.
   - `CRON_SECRET`: long random secret used to authenticate scheduled backups.
   - `BACKUP_SOURCE_BUCKET`: source bucket for daily backup.
   - `BACKUP_DESTINATION_BUCKET`: different destination bucket.
   - `BACKUP_PREFIX`: optional destination prefix (defaults to `daily/YYYY-MM-DD/`).
   - `B2_MASTER_KEY_ID`: optional account/master key ID for key administration only.
   - `B2_MASTER_APPLICATION_KEY`: matching account/master key secret; server-side only.
3. Redeploy.

Create a Backblaze application key with only the required bucket and read/write/list/delete capabilities. Never put credentials in frontend code or commit them to GitHub.

## Notes
- Upload URLs expire after 15 minutes; download URLs after 10 minutes.
- Files up to 100 MiB use a single presigned PUT; larger files use 64 MiB multipart chunks. Configure bucket CORS with the dashboard button first. Multipart ETag exposure is required.
- Bucket deletion succeeds only when the bucket is empty.
- Lifecycle rule support depends on the S3-compatible API and key capabilities available for your B2 account. Verify rules in the Backblaze console after saving.
- Daily cron runs at 03:00 UTC. Vercel plan limits apply; long-running backups may time out. For large buckets, use a dedicated worker or split backup jobs. The current scheduled backup copies current objects only and does not preserve source versions.
- Key administration requires account/master key credentials. Keep these in Vercel environment variables and never expose them in the browser. Newly created key secrets are returned once only.
- Analytics scans up to 100,000 objects per bucket per request; it marks incomplete scans.
- Use HTTPS in production. Do not expose the admin password or B2 keys in client-side code.


## Important limitations
- The S3 multipart flow is suitable for large files, but the deployment's function timeouts still apply to API calls; file bytes travel directly from browser to B2.
- Bucket deletion only works when empty. Object Lock and retained versions may prevent permanent deletion.
- Test lifecycle, CORS and key-management operations with a narrowly scoped test bucket/key before production use.
