'use strict';
const server = require('./lib/server.js');
const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const setUpJob = require('./bin/create-config');


/* eslint-disable */
app.use((err, req, res, next) => {
  console.log('err', err);
});
/* eslint-enable */

server.start(app, PORT)
  .then(console.log)
  .then(() => setUpJob.start())
  .catch(console.log);
