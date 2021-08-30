const serverless = require('serverless-http');
const app = require('./app');
const Database = require('./Database');

const binaryMimeTypes = { binary: ['image/jpeg', 'image/png'] };
const handler = serverless(app, binaryMimeTypes);
module.exports.handler = async (event, context) => {
  await Database.connect();
  const result = await handler(event, context);
  return result;
};
