require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const imageRoutes = require('./routes/image');
const apiImageRoutes = require('./routes/api-image');
const apiImagesRoutes = require('./routes/api-images');

const app = express();

app.use(morgan('dev'));

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'DELETE');
  next();
});

app.use('/image', imageRoutes);
app.use('/api/image', apiImageRoutes);
app.use('/api/images', apiImagesRoutes);

app.use((_req, _res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, _req, res, _next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
