const fs = require('fs')
const express = require('express');
const fileUpload = require('express-fileupload')
const app = express();
const xlsx = require('xlsx');
const _rest = '/upload'

app.use(fileUpload())

// PENDIENTES::::::::::::::::::
// probar si el archivo no es excel, si está vacío




// OK
app.get('/download/:fileName', function(req, res) {
    const file = req.params.fileName
    var filePath = `${__dirname}/files/${file}`;
    if (fs.existsSync(filePath)) {
        return res.status(200).download(filePath)
    } else {
        return res.status(500).json({
            ok: false,
            msg: `archivo con el nombre '${file}' no encontrado`
        })
    }
});
// OK
app.post('/upload', (req, res) => {
    let EDFile = req.files.file
    const fileName = EDFile.name.replace(/\s+/g, '')
    EDFile.mv(`${__dirname}/files/${fileName}`, err => {
        if (err) {
            console.log(err)
            return res.status(500).send({ message: err })
        }
        const result = readExcel(fileName);
        return res.status(200).send({ message: `Archivo '${EDFile.name}' cargado, puede buscarlo con el siguiente nombre: ${result.fileName}` })
    })
})

app.post('/upload_transform', function(req, res) {
    let EDFile = req.files.file
    const fileName = EDFile.name.replace(/\s+/g, '')
    EDFile.mv(`${__dirname}/files/${fileName}`, err => {
        if (err) {
            console.log(err)
            return res.status(500).send({ message: err })
        }
        const result = readExcel(fileName);
        return res.status(200).download(result.fullPath);
    })
})

// probar si el archivo no es excel, si está vacío
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
    const fileName = `transformed_${originalName}`
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

module.exports = app;