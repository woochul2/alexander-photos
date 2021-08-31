const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Database = require('../Database');

const router = express.Router();

const storage = multerS3({
  s3: new aws.S3(),
  bucket: 'alexander-photos-images',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (_req, file, cb) {
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

const upload = multer({ storage, fileFilter });

router.post('/', upload.single('photo'), async (req, res) => {
  const exifData = JSON.parse(req.body.exifData || null);
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
