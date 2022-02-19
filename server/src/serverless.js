const serverless = require('serverless-http');
const app = require('./app');
const db = require('./database');

const binaryMimeTypes = { binary: ['image/jpeg', 'image/png', 'image/gif'] };
const handler = serverless(app, binaryMimeTypes);

module.exports.handler = async (event, context) => {
  await db.connect();
  const result = await handler(event, context);
  return result;
};
