const aws = require('aws-sdk');
const express = require('express');
const fs = require('fs').promises;
const multer = require('multer');
const sharp = require('sharp');
const { IMG_BUCKET } = require('../constants');
const Database = require('../Database');
const { getDateTime } = require('../utils/getDateTime');

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

  const exifData = { ...JSON.parse(req.body.exifData || null) };
  if (!exifData.dateTime) exifData.dateTime = getDateTime();
  if (!exifData.orientation) exifData.orientation = 1;
  if (!exifData.pixelXDimension || !exifData.pixelYDimension) {
    const { width, height } = await sharp(req.file.path).metadata();
    exifData.pixelXDimension = width;
    exifData.pixelYDimension = height;
  }
  const photo = { filePath: req.file.originalname, ...exifData };

  const insertToDatabase = async () => {
    const image = await Database.findOne('images', photo);
    if (!image) await Database.insertOne('images', photo);
  };

  try {
    await Promise.all([uploadToS3(), insertToDatabase()]);
    res.status(201).json({
      message: `Uploaded ${req.file.originalname} successfully`,
      result: photo,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.delete('/:imageName', async (req, res) => {
  try {
    const { imageName } = req.params;
    const query = { filePath: imageName };
    const image = await Database.findOne('images', query);
    if (!image) throw new Error(`${imageName} does not exist`);

    const deleteFromS3 = async () => {
      await s3
        .deleteObject({
          Bucket: IMG_BUCKET,
          Key: imageName,
        })
        .promise();
    };
    deleteFromS3();

    await Database.deleteOne('images', query);
    res.status(200).json({
      message: `Deleted ${imageName} successfully`,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
