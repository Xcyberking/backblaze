const axios = require('axios');
const { authorize, verifyToken } = require('./_b2');

module.exports = async (req, res) => {
  try {
    verifyToken(req);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { fileId, fileName } = req.body || {};
    if (!fileId || !fileName) {
      return res.status(400).json({ error: 'fileId and fileName required' });
    }

    const auth = await authorize();

    const r = await axios.post(
      `${auth.apiUrl}/b2api/v3/b2_delete_file_version`,
      { fileId, fileName },
      { headers: { Authorization: auth.token } }
    );

    res.json({ success: true, deleted: r.data.fileName });
  } catch (err) {
    res.status(err.message === 'No token' ? 401 : 500).json({
      error: err.response?.data?.message || err.message,
    });
  }
};