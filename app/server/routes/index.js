const express = require('express');
const app = express();

app.use(require('./upload'));

module.exports = app;