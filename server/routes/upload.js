const fs = require('fs')
const express = require('express');
const fileUpload = require('express-fileupload')
const app = express();
const xlsx = require('xlsx');
const _folder = '/files'

app.use(fileUpload())

// OK
app.get('/listfiles', (req, res) => {
    const path = require('path');
    const dir = `${__dirname}${_folder}`;
    if (!fs.existsSync(dir)) {
        return res.json({
            ok: true,
            msg: 'No hay archivos almacenados'
        })
    }
    const arrFiles = [];
    fs.readdir(dir, function(err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach((file) => arrFiles.push({ file, path: path.resolve(file) }));
        return res.status(200).json({
            ok: true,
            files: arrFiles
        })
    });
})

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

function downloadFile(req, res) {
    const file = req.params.fileName
    let filePath = `${__dirname}${_folder}/${file}`;
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
    const dir = `${__dirname}${_folder}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    let EDFile = req.files.file
    const fileName = EDFile.name.replace(/\s+/g, '')
    EDFile.mv(`${__dirname}${_folder}/${fileName}`, err => {
        if (err) {
            console.log(err.message)
            return res.status(500).send({ message: err, err: err.message })
        }
        const result = readExcel(fileName);
        if (calledBy === 'UPLOAD') {
            return res.status(200).send({
                ok: true,
                message: `Archivo '${EDFile.name}' cargado y transformado, puede buscarlo con el siguiente nombre: ${result.fileName}`,
                fileName: result.fileName
            })
        } else {
            return res.status(200).download(`${__dirname}${_folder}/${result.fileName}`)
        }
    })
}

function readExcel(fileName) {
    const path = `${__dirname}${_folder}/${fileName}`
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
    const fullPath = `${__dirname}${_folder}/${fileName}`
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

module.exports = app;