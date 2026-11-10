const axios = require('axios');

let cache = { auth: null, time: 0 };

async function authorize() {
  if (cache.auth && Date.now() - cache.time < 23 * 60 * 60 * 1000) {
    return cache.auth;
  }

  const creds = Buffer.from(
    `${process.env.B2_KEY_ID}:${process.env.B2_APP_KEY}`
  ).toString('base64');

  const res = await axios.get(
    'https://api.backblazeb2.com/b2api/v3/b2_authorize_account',
    { headers: { Authorization: `Basic ${creds}` } }
  );

  const data = res.data;
  const auth = {
    apiUrl: data.apiInfo.storageApi.apiUrl,
    downloadUrl: data.apiInfo.storageApi.downloadUrl,
    accountId: data.accountId,
    token: data.authorizationToken,
  };

  cache = { auth, time: Date.now() };
  return auth;
}

async function getBucketId() {
  if (process.env.B2_BUCKET_ID) return process.env.B2_BUCKET_ID;

  const auth = await authorize();
  const res = await axios.post(
    `${auth.apiUrl}/b2api/v3/b2_list_buckets`,
    { accountId: auth.accountId, bucketName: process.env.B2_BUCKET_NAME },
    { headers: { Authorization: auth.token } }
  );
  return res.data.buckets[0].bucketId;
}

function verifyToken(req) {
  const jwt = require('jsonwebtoken');
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  if (!token) throw new Error('No token');
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { authorize, getBucketId, verifyToken };