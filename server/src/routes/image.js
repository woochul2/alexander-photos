const aws = require('aws-sdk');
const express = require('express');

const router = express.Router();
const s3 = new aws.S3();

router.get('/:image', async (req, res) => {
  try {
    const s3Object = await s3
      .getObject({
        Bucket: 'alexander-photos-images',
        Key: req.params.image,
      })
      .promise();
    res.writeHead(200, { 'Content-Type': s3Object.ContentType });
    res.end(s3Object.Body);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
});

module.exports = router;
