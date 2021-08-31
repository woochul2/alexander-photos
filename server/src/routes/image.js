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

    const { height } = await sharp(s3Object.Body).metadata();
    const newHeight = req.query.h ? Math.min(parseInt(req.query.h), height) : Math.min(height, 250);
    const resizedImg = await sharp(s3Object.Body).rotate().resize({ height: newHeight }).toBuffer();
    res.contentType(s3Object.ContentType);
    res.send(resizedImg);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
