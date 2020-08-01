const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();

const log = [];
fs
    .createReadStream(__dirname + '/log.csv')
    .pipe(csv())
    .on('data', (row) => log.push(row))

app.use((req, res, next) => {
    const agent = req.get('user-agent').replace(/\,/g,"");
    const date = new Date();
    const time = date.toISOString();
    const method = req.method;
    const resource = req.path;
    const version = `HTTP/${req.httpVersion}`;
    const status = 200;
    const payload = `\n${agent},${time},${method},${resource},${version},${status}`;

    fs
        .appendFile(__dirname + '/log.csv', payload, (err) => {
            if(err) throw err;
        })  

    fs
        .createReadStream(__dirname + '/log.csv')
        .pipe(csv())
        .on('data', (row) => log.push(row))

    next();
});

app.get('/', (req, res) => {
    console.log(log);
    res.status(200).send('ok');
});

app.get('/logs', (req, res) => {
    res.json(log);

});

module.exports = app;
