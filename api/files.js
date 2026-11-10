const axios = require('axios');
const { authorize, getBucketId, verifyToken } = require('./_b2');

module.exports = async (req, res) => {
  try {
    verifyToken(req);

    const auth = await authorize();
    const bucketId = await getBucketId();

    const { prefix = '', delimiter = '/' } = req.query;

    // 1. Get Total Bucket Storage Info
    const bucketInfoReq = await axios.post(
      `${auth.apiUrl}/b2api/v3/b2_list_buckets`,
      { accountId: auth.accountId, bucketId: bucketId },
      { headers: { Authorization: auth.token } }
    );
    const bucketInfo = bucketInfoReq.data.buckets[0];

    // 2. List Files inside the current folder (prefix)
    const r = await axios.post(
      `${auth.apiUrl}/b2api/v3/b2_list_file_names`,
      {
        bucketId,
        prefix,
        delimiter,
        maxFileCount: 1000,
      },
      { headers: { Authorization: auth.token } }
    );

    // Filter out the dummy zero-byte file that represents the folder itself
    const files = r.data.files
      .filter((f) => f.fileName !== prefix) 
      .map((f) => ({
        id: f.fileId,
        name: f.fileName,
        size: f.contentLength,
        type: f.contentType,
        uploaded: f.uploadTimestamp,
      }));

    // Folders are provided directly by Backblaze API now
    const folders = r.data.folders || [];

    res.json({
      files,
      folders,
      storage: {
        total: bucketInfo.bucketInfo?.storageBytes 
            || bucketInfo.storageBytes 
            || 0, // Total used by this bucket
        limit: 10 * 1024 * 1024 * 1024 // 10GB default B2 free limit (you can change this)
      }
    });

  } catch (err) {
    res.status(err.message === 'No token' ? 401 : 500).json({
      error: err.response?.data?.message || err.message,
    });
  }
};