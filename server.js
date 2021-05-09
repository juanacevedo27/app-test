require('./server/config/config')
const cors = require('cors')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


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
        msg: 'app running on aws!!!'
    })
})

app.listen(process.env.PORT, () => {
    console.log('Running on port: ', process.env.PORT);
})