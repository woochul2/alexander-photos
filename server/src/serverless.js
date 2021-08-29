const serverless = require('serverless-http');
const app = require('./app');
const Database = require('./Database');

Database.connect();

module.exports.handler = serverless(app);
