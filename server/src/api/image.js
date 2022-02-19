const aws = require('aws-sdk');
const express = require('express');
const { ObjectId } = require('mongodb');
const fs = require('fs').promises;
const multer = require('multer');
const { IMG_BUCKET } = require('../constants');
const db = require('../database');
const getExifData = require('../utils/getExifData');

const router = express.Router();

const storage = multer.diskStorage({
  filename(_req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (_req, file, cb) => {
  const types = ['image/jpeg', 'image/png', 'image/gif'];
  if (types.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const s3 = new aws.S3();
const upload = multer({ storage, fileFilter });

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const image = await db.readImage({ _id: ObjectId(id) });
    res.status(200).json({
      result: image,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { path, originalname, mimetype } = req.file;
    const exifData = await getExifData(req.body.exifData, path);

    const photo = {
      filePath: `${exifData.dateTime}/${originalname}`,
      ...exifData,
    };

    const image = await db.readImage(photo);
    if (image) throw new Error(`${originalname} already exists.`);

    const uploadToS3 = async () => {
      const file = await fs.readFile(path);
      const s3Request = {
        Bucket: IMG_BUCKET,
        Key: photo.filePath,
        Body: file,
        ContentType: mimetype,
      };
      await s3.upload(s3Request).promise();
    };

    await Promise.all([db.addImage(photo), uploadToS3()]);

    res.status(201).json({
      message: `Uploaded ${originalname} successfully`,
      result: photo,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.delete('/:dirName/:fileName', async (req, res) => {
  try {
    const { dirName, fileName } = req.params;
    const filePath = `${dirName}/${fileName}`;
    const query = { filePath };
    const image = await db.readImage(query);
    if (!image) throw new Error(`${filePath} does not exist`);

    const deleteFromS3 = async () => {
      const s3Request = {
        Bucket: IMG_BUCKET,
        Key: filePath,
      };
      await s3.deleteObject(s3Request).promise();
    };
    deleteFromS3();

    await Promise.all([db.deleteImage(query), deleteFromS3()]);

    res.status(200).json({
      message: `Deleted ${filePath} successfully`,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
