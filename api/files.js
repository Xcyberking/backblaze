const axios = require('axios');
const { authorize, getBucketId, verifyToken } = require('./_b2');

module.exports = async (req, res) => {
  try {
    verifyToken(req);

    const auth = await authorize();
    const bucketId = await getBucketId();
    const { prefix = '' } = req.query;

    // 1. Get Bucket Storage Info
    const bucketInfoReq = await axios.post(
      `${auth.apiUrl}/b2api/v3/b2_list_buckets`,
      { accountId: auth.accountId, bucketId: bucketId },
      { headers: { Authorization: auth.token } }
    );
    const bucketInfo = bucketInfoReq.data.buckets[0];

    // 2. List Files (WITHOUT delimiter to get raw files properly)
    const r = await axios.post(
      `${auth.apiUrl}/b2api/v3/b2_list_file_names`,
      {
        bucketId,
        prefix,
        maxFileCount: 1000,
      },
      { headers: { Authorization: auth.token } }
    );

    const files = [];
    const foldersSet = new Set();

    // 3. Smart Filter: Backblaze folders ko 0B file k form m bhejta h, use yahan alag karenge
    r.data.files.forEach((f) => {
      const fileName = f.fileName;
      
      // Agar prefix hai (e.g., "scripts/"), toh usko hata do taaki sirf aage ka naam dikhe
      const relativeName = fileName.substring(prefix.length);

      // Agar relative name m '/' hai, iska matlab ye andar ka folder ya file hai
      const slashIndex = relativeName.indexOf('/');

      if (slashIndex !== -1) {
        // Ye ek folder hai (e.g., agar name "scripts/logs/" hai)
        const folderName = relativeName.substring(0, slashIndex + 1);
        foldersSet.add(folderName);
      } else {
        // Ye ek asli file hai (size 0 se badi, ya bina slash wali)
        if (relativeName !== '') {
          files.push({
            id: f.fileId,
            name: fileName, // Full path for download/delete
            displayName: relativeName, // Sirf file ka naam
            size: f.contentLength,
            type: f.contentType,
            uploaded: f.uploadTimestamp,
          });
        }
      }
    });

    // Folders ko array me convert karein
    const folders = Array.from(foldersSet);

    res.json({
      files,
      folders,
      storage: {
        // Backblaze API me direct total storage nahi milta easily, isliye approx 10GB limit dikha rahe hain
        total: bucketInfo.bucketInfo?.storageBytes || bucketInfo.storageBytes || 0,
        limit: 10 * 1024 * 1024 * 1024 // 10GB
      }
    });

  } catch (err) {
    res.status(err.message === 'No token' ? 401 : 500).json({
      error: err.response?.data?.message || err.message,
    });
  }
};