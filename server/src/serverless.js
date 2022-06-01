const serverless = require('serverless-http');
const app = require('./app');
const db = require('./database');

const binaryMimeTypes = { binary: ['image/jpeg', 'image/png', 'image/gif'] };
const handler = serverless(app, binaryMimeTypes);

const connectPromise = db.connect();

module.exports.handler = async (event, context) => {
  if (event['my-type'] === 'Warmer') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  await connectPromise;
  const result = await handler(event, context);
  return result;
};
