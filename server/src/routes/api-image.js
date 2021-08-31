const aws = require('aws-sdk');
const express = require('express');
const fs = require('fs/promises');
const multer = require('multer');
const sharp = require('sharp');
const { IMG_BUCKET } = require('../constants');
const Database = require('../Database');

const router = express.Router();

const storage = multer.diskStorage({
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const s3 = new aws.S3();
const upload = multer({ storage, fileFilter });

router.post('/', upload.single('photo'), async (req, res) => {
  const uploadToS3 = async () => {
    const file = await fs.readFile(req.file.path);
    await s3
      .upload({
        Bucket: IMG_BUCKET,
        Key: req.file.originalname,
        Body: file,
        ContentType: req.file.mimetype,
      })
      .promise();
  };

  uploadToS3();

  const getExifData = async () => {
    if (req.body.exifData) return JSON.parse(req.body.exifData);
    const { width, height } = await sharp(req.file.path).metadata();
    return { PixelXDimension: width, PixelYDimension: height };
  };
  const exifData = await getExifData();

  const photo = { filePath: req.file.originalname, ...exifData };

  try {
    const image = await Database.findOne('images', photo);
    if (!image) await Database.insertOne('images', photo);
    res.status(201).json({
      message: 'Uploaded image successfully',
      result: photo,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
