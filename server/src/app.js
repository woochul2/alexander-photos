import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import imagesRoutes from './api/routes/images.js';
import Database from './Database.js';
dotenv.config();

Database.connect();

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/images', imagesRoutes);

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

export default app;
