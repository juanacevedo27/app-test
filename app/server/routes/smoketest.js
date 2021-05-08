const express = require('express');
const app = express();

const _rest = '/smoke-test'

app.get(_rest, function(req, res) {
    res.json({
        process: true,
        message: 'Backend is running'
    })
})