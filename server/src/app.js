require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const imageRoute = require('./routes/image');
const imageAPI = require('./api/image');
const imagesAPI = require('./api/images');

const app = express();

app.use(morgan('dev'));

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'DELETE');
  next();
});

app.use('/image', imageRoute);
app.use('/api/image', imageAPI);
app.use('/api/images', imagesAPI);

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
