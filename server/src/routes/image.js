const aws = require('aws-sdk');
const express = require('express');
const sharp = require('sharp');

const router = express.Router();
const s3 = new aws.S3();

router.get('/:imageName', async (req, res) => {
  try {
    const s3Object = await s3
      .getObject({
        Bucket: 'alexander-photos-images',
        Key: req.params.imageName,
      })
      .promise();

    const { width } = await sharp(s3Object.Body).metadata();
    const newWidth = req.query.w ? Math.min(parseInt(req.query.w), width) : Math.min(width, 500);
    const resizedImg = await sharp(s3Object.Body).resize(newWidth).toBuffer();
    res.contentType(s3Object.ContentType);
    res.send(resizedImg);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
