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

## Deploy
1. Import this repository into Vercel.
2. Add environment variables:
   - `ADMIN_PASSWORD`: strong dashboard password.
   - `B2_KEY_ID`: Backblaze application key ID.
   - `B2_APPLICATION_KEY`: Backblaze application key secret.
   - `B2_ENDPOINT`: e.g. `https://s3.us-east-005.backblazeb2.com` (use your bucket's actual region).
   - `B2_REGION`: e.g. `us-east-005`.
3. Redeploy.

Create a Backblaze application key with only the required bucket and read/write/list/delete capabilities. Never put credentials in frontend code or commit them to GitHub.

## Notes
- Upload URLs expire after 15 minutes; download URLs after 10 minutes.
- The current browser upload path uses a single S3 PUT. For objects larger than 5 GB, multipart upload support should be added.
- Bucket deletion succeeds only when the bucket is empty.
- Version retention, Object Lock and lifecycle policies depend on bucket configuration and key permissions; this UI displays versions but does not alter retention settings.
- Use HTTPS in production. Do not expose the admin password or B2 keys in client-side code.
