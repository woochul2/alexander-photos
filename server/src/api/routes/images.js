import express from 'express';
import multer from 'multer';
import Database from '../../Database.js';
import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: 'hascensnx',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    cloudinary.v2.uploader.upload(file.path, { use_filename: true, unique_filename: false });
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

export default router;
