const serverless = require('serverless-http');
const app = require('./app');
const Database = require('./Database');

const handler = serverless(app);
module.exports.handler = async (event, context) => {
  await Database.connect();
  const result = await handler(event, context);
  return result;
};
