require('./config/config')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// 
const path = require('path');
const multer = require('multer');
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '.files')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldName + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage })

// 

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
    // parse application/json
app.use(express.json())

app.use(require('./routes/index'));

app.get('/smoketest', (req, res) => {
    console.log('app running!')
    res.json({
        ok: true,
        msg: 'app running!'
    })
})

app.post('/subir', upload.single('recfile'), (req, res) => {
    console.log('storage location is ' + req.hostname + '/' + req.file.path)
    return res.send(req.file);
})

app.listen(process.env.PORT, () => {
    console.log('Running on port: ', process.env.PORT);
})