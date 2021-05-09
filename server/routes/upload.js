const express = require('express');
const app = express();
const xlsx = require('xlsx');
const _rest = '/upload'

app.post(_rest, function(req, res) {
    const result = readExcel();
    res.json({
        process: true,
        msg: 'process to upload file',
        result: `file created: ${result}`
    })
})

function readExcel() {
    const path = `${__dirname}/files/prueba_Dllo.xlsx`
    const wb = xlsx.readFile(path)
    const wbs = wb.SheetNames;
    const sheet = wbs[0];
    const dataExcel = xlsx.utils.sheet_to_csv(wb.Sheets[sheet], { FS: "|" })
    const resultWR = writeTxt(dataExcel);
    return resultWR;
}

function writeTxt(data) {
    const fs = require('fs');
    const d = new Date()
    const date = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()}--${d.getTime()}`
    const fileName = `file-${date}.txt`
    let writeStream = fs.createWriteStream(`${__dirname}/files/${fileName}`);
    writeStream.write(data);
    writeStream.on('finish', () => {
        console.log('finish');
    });
    writeStream.end();
    return fileName;
    // download(fileName);
}

// function download(fileName) {
//     const download = require('download');
//     const filePath = `${__dirname}/`;
//     console.log(filePath)
//     download(filePath + fileName)
//         .then(() => {
//             console.log('Download Completed');
//         })
// }


module.exports = app;