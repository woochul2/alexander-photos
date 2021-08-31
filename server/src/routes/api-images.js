const express = require('express');
const Database = require('../Database');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const images = await Database.find('images');
    res.status(200).json({
      results: images,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
