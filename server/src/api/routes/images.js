import express from 'express';
import Database from '../../Database.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const results = await Database.find('images');
  res.status(200).json({
    results,
  });
});

export default router;
