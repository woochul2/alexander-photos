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

router.get('/', async (_req, res) => {
  const images = await Database.find('images');
  res.status(200).json({
    results: images,
  });
});

router.post('/', upload.array('photos'), async (req, res) => {
  const insertQuery = async (photo) => {
    const image = await Database.findOne('images', photo);
    if (!image) await Database.insertOne('images', photo);
  };

  const exifDatas = typeof req.body.exifDatas === 'string' ? [req.body.exifDatas] : req.body.exifDatas;
  const photos = req.files.map((file, idx) => {
    const exifData = JSON.parse(exifDatas[idx]);
    const photo = { filePath: file.originalname, ...exifData };
    return photo;
  });

  try {
    await Promise.all(
      photos.reduce((prevList, photo) => {
        return [...prevList, insertQuery(photo)];
      }, [])
    );
    res.status(201).json({
      message: 'Uploaded images successfully',
      results: photos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error,
    });
  }
});

module.exports = router;
