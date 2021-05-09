require('./server/config/config')
const cors = require('cors')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
    // parse application/json
app.use(express.json())

app.use(require('./server/routes/index'));

app.get('/', (req, res) => {
    console.log('app running!')
    res.json({
        ok: true,
        msg: 'app running!'
    })
})

app.listen(process.env.PORT, () => {
    console.log('Running on port: ', process.env.PORT);
})