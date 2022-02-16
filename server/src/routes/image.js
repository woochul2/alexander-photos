const aws = require('aws-sdk');
const express = require('express');
const sharp = require('sharp');
const { IMG_BUCKET } = require('../constants');
const getResizeOption = require('../utils/getResizeOption');

const router = express.Router();
const s3 = new aws.S3();

router.get('/:filePath', async (req, res) => {
  try {
    const s3Request = {
      Bucket: IMG_BUCKET,
      Key: req.params.filePath,
    };
    const s3Object = await s3.getObject(s3Request).promise();

    const { w, h } = req.query;
    const resizeOption = await getResizeOption(w, h, s3Object.Body);
    const resizedImg = await sharp(s3Object.Body)
      .rotate()
      .resize(resizeOption)
      .toBuffer();

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
    const s3Request = {
      Bucket: IMG_BUCKET,
      Key: req.params.filePath,
    };
    const s3Object = await s3.getObject(s3Request).promise();

    res.contentType(s3Object.ContentType);
    res.send(s3Object.Body);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
