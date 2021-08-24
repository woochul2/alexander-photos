import aws from 'aws-sdk';
import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import Database from '../../Database.js';

const router = express.Router();

const s3 = new aws.S3();

const storage = multerS3({
  s3,
  bucket: 'alexander-photos-images',
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (_req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
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
  const results = await Database.find('images');
  res.status(200).json({
    results,
  });
});

router.post('/', upload.array('photos'), async (req, res) => {
  const photos = req.files.map((file) => {
    return {
      filePath: file.originalname,
    };
  });
  try {
    await Database.insertMany('images', photos);
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

export default router;
