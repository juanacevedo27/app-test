const express = require('express');
const app = express();

app.use(require('./upload'));
// app.use(require('./smoketest'));

module.exports = app;