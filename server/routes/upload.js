const fs = require('fs')
const express = require('express');
const fileUpload = require('express-fileupload')
const app = express();
const xlsx = require('xlsx');
const _rest = '/upload'

app.use(fileUpload())

// PENDIENTES::::::::::::::::::
// revisar como garantizar la alta disponibilidad
// revisar los costos de los servicios codepipeline y beanstalk

// OK
app.get('/download/:fileName', function(req, res) {
    downloadFile(req, res)
});

// OK
app.post('/upload', (req, res) => {
    const restApi = 'UPLOAD'
    if (req.files && req.files.file) {
        checkFile(req, res)
        uploadFile(req, res, restApi)
    } else {
        return res.status(400).json({
            ok: false,
            msg: `Debe enviar un archivo para cargarlo con la llave llamada 'file'`
        })
    }
})

function checkFile(req, res) {
    let file = req.files.file.name.split('.');
    if (file.length > 2) {
        return res.status(400).json({
            ok: false,
            msg: 'Parece que el nombre del archivo contiene 2 extensiones, asegurese de que solo contenga 1 punto(.)'
        });
    }
    if (file[1].toLowerCase() != 'xlsx') {
        return res.status(400).json({
            ok: false,
            msg: `El archivo debe contener un formato .xlsx, está intentando cargar un tipo .${file[1]}`
        });
    }
    return true;
}

app.post('/upload_transform', function(req, res) {
    const restApi = 'UPLOAD_TRANSFORM'
    if (req.files && req.files.file) {
        checkFile(req, res)
        uploadFile(req, res, restApi)
    } else {
        return res.status(400).json({
            ok: false,
            msg: `Debe enviar un archivo para cargarlo con la llave llamada 'file'`
        })
    }
})

function downloadFile(req, res) {
    const file = req.params.fileName
    let filePath = `${__dirname}/files/${file}`;
    if (fs.existsSync(filePath)) {
        return res.status(200).download(filePath)
    } else {
        return res.status(500).json({
            ok: false,
            msg: `archivo con el nombre '${file}' no encontrado`
        })
    }
}

function uploadFile(req, res, calledBy) {
    let EDFile = req.files.file
    const fileName = EDFile.name; //.replace(/\s+/g, '')
    EDFile.mv(`${__dirname}/files/${fileName}`, err => {
        if (err) {
            console.log(err.message)
            return res.status(500).send({ message: err, err: err.message })
        }
        const result = readExcel(fileName);
        console.log(calledBy)
        if (calledBy === 'UPLOAD') {
            return res.status(200).send({ message: `Archivo '${EDFile.name}' cargado y transformado, puede buscarlo con el siguiente nombre: ${result.fileName}` })
        } else {
            console.log(result.fullPath)
            return res.status(200).download(`${__dirname}/files/${result.fileName}`)
        }
    })
}

function readExcel(fileName) {
    const path = `${__dirname}/files/${fileName}`
    const wb = xlsx.readFile(path)
    const wbs = wb.SheetNames;
    const sheet = wbs[0];
    const dataExcel = xlsx.utils.sheet_to_csv(wb.Sheets[sheet], { FS: "|" })
    const resultWR = writeTxt(dataExcel, fileName);
    return resultWR;
}

function writeTxt(data, originalName) {
    const fs = require('fs');
    const transfName = originalName.split('.')
    const fileName = `transformed_${transfName[0]}.txt`
    const fullPath = `${__dirname}/files/${fileName}`
    let writeStream = fs.createWriteStream(fullPath);
    writeStream.write(data);
    writeStream.on('finish', () => {
        console.log('finish');
    });
    writeStream.end();
    return {
        fullPath: fullPath,
        fileName: fileName,
        data: data
    };
}

app.get('/listfiles', (req, res) => {
    const path = require('path');
    const fs = require('fs');
    const directoryPath = path.join(__dirname, 'files');
    const arrFiles = [];
    fs.readdir(directoryPath, function(err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach((file) => arrFiles.push({ file, path: path.resolve(file) }));
        res.status(200).json({
            ok: true,
            files: arrFiles
        })
    });
})
module.exports = app;