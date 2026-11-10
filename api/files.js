const axios = require('axios');
const { authorize, getBucketId, verifyToken } = require('./_b2');

module.exports = async (req, res) => {
  try {
    verifyToken(req);

    const { fileName } = req.query;
    if (!fileName) {
      return res.status(400).json({ error: 'fileName required' });
    }

    const auth = await authorize();
    const bucketId = await getBucketId();

    const r = await axios.post(
      `${auth.apiUrl}/b2api/v3/b2_get_download_authorization`,
      {
        bucketId,
        fileNamePrefix: fileName,
        validDurationInSeconds: 3600, // 1 hour valid
      },
      { headers: { Authorization: auth.token } }
    );

    const url = `${auth.downloadUrl}/file/${process.env.B2_BUCKET_NAME}/${encodeURIComponent(fileName)}?Authorization=${r.data.authorizationToken}`;

    res.json({ url });
  } catch (err) {
    res.status(err.message === 'No token' ? 401 : 500).json({
      error: err.response?.data?.message || err.message,
    });
  }
};