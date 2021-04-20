const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const jsonParser = bodyParser.json();


app.get('/', (req, res) => {
    res.send('this is home');
});

app.post('/', jsonParser, (req, res) => {
    let postData = req.body;

    const workBook = xlsx.readFile('./Database.xlsx');
    const workSheet = workBook.Sheets['Pesanan'];
    workSheet['!cols'] = [
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 }
    ];
    const pesananJSON = xlsx.utils.sheet_to_json(workSheet);
    pesananJSON.push({
        Tanggal: postData.tanggal,
        Jam: postData.jam,
        'Uang Tunai': postData.uangTunai,
        Kembalian: postData.kembalian,
        'Harga Total': postData.totalHarga
    });

    xlsx.utils.sheet_add_json(workSheet, pesananJSON);
    xlsx.writeFile(workBook, './Database.xlsx');

    res.send(postData);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});