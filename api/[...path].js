import buckets from "./_lib/handlers/buckets.js";
import files from "./_lib/handlers/files.js";
import uploadUrl from "./_lib/handlers/upload-url.js";
import remove from "./_lib/handlers/delete.js";
import downloadUrl from "./_lib/handlers/download-url.js";
import copy from "./_lib/handlers/copy.js";
import cors from "./_lib/handlers/cors.js";
import multipart from "./_lib/handlers/multipart.js";
import lifecycle from "./_lib/handlers/lifecycle.js";
import analytics from "./_lib/handlers/analytics.js";
import restore from "./_lib/handlers/restore.js";
import backup from "./_lib/handlers/backup.js";
import backupRestore from "./_lib/handlers/backup-restore.js";
import keys from "./_lib/handlers/keys.js";
import protection from "./_lib/handlers/protection.js";
import bucketAccess from "./_lib/handlers/bucket-access.js";
import versioning from "./_lib/handlers/versioning.js";

const routes = {
  buckets, files, "upload-url": uploadUrl, delete: remove,
  "download-url": downloadUrl, copy, cors, multipart, lifecycle,
  analytics, restore, backup, "backup-restore": backupRestore,
  keys, protection, "bucket-access": bucketAccess, versioning
};

export default async function handler(req, res) {
  const raw = req.query?.path;
  const route = Array.isArray(raw) ? raw.join("/") : String(raw || "");
  const target = routes[route];
  if (!target) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: "API route not found" }));
  }
  return target(req, res);
}
