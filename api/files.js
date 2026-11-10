const axios = require('axios');
const { authorize, getBucketId, verifyToken } = require('./_b2');

module.exports = async (req, res) => {
  try {
    verifyToken(req);

    const auth = await authorize();
    const bucketId = await getBucketId();

    const {
      startFileName = '',
      prefix = '',
      maxCount = 1000,
      delimiter = '/',
    } = req.query;

    const body = {
      bucketId,
      startFileName,
      prefix,
      maxFileCount: Math.min(parseInt(maxCount), 1000),
    };

    if (delimiter) body.delimiter = delimiter;

    const r = await axios.post(
      `${auth.apiUrl}/b2api/v3/b2_list_file_names`,
      body,
      { headers: { Authorization: auth.token } }
    );

    // Filter and map files to ensure accurate data
    const files = r.data.files.map((f) => ({
      id: f.fileId,
      name: f.fileName,
      size: f.contentLength,
      sizeMB: (f.contentLength / (1024 * 1024)).toFixed(2),
      type: f.contentType,
      uploaded: f.uploadTimestamp,
      action: f.action,
    }));

    res.json({
      files,
      folders: r.data.folders || [],
      nextFileName: r.data.nextFileName || null,
    });
  } catch (err) {
    res.status(err.message === 'No token' ? 401 : 500).json({
      error: err.response?.data?.message || err.message,
    });
  }
};