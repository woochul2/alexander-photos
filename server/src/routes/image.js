const aws = require('aws-sdk');
const express = require('express');
const sharp = require('sharp');
const { IMG_BUCKET } = require('../constants');

const router = express.Router();
const s3 = new aws.S3();

router.get('/:filePath', async (req, res) => {
  try {
    const s3Object = await s3
      .getObject({
        Bucket: IMG_BUCKET,
        Key: req.params.filePath,
      })
      .promise();

    const getResizeOption = async () => {
      const { width, height } = await sharp(s3Object.Body).metadata();
      const { w, h } = req.query;
      if (w && h) return { width: Math.min(parseInt(w), width), height: Math.min(parseInt(h), height), fit: 'fill' };
      else if (w && !h) return { width: Math.min(parseInt(w), width) };
      else if (!w && h) return { height: Math.min(parseInt(h), height) };
      return {};
    };

    const resizeOption = await getResizeOption();
    const resizedImg = await sharp(s3Object.Body).rotate().resize(resizeOption).toBuffer();
    res.contentType(s3Object.ContentType);
    res.send(resizedImg);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get('/original/:filePath', async (req, res) => {
  try {
    const s3Object = await s3
      .getObject({
        Bucket: IMG_BUCKET,
        Key: req.params.filePath,
      })
      .promise();

    res.contentType(s3Object.ContentType);
    res.send(s3Object.Body);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
