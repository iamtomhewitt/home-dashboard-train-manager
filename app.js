const express = require('express');
const bodyParser = require('body-parser');
const listEndpoints = require('express-list-endpoints');
const request = require('request');

const app = express();

const { version } = require('./package.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send({ status: '🚂 SERVER OK', version, endpoints: listEndpoints(app) });
});

app.get('/departures', (req, res) => {
    const { stationCode } = req.body;
    const { apiKey } = req.body;
    const { numberOfResults } = req.body;
    const url = `https://huxley.apphb.com/departures/${stationCode}/${numberOfResults}?accessToken=${apiKey}`;

    request(url, (err, resp, body) => {
        if (err) {
            throw (err);
        }
    });


    res.status(200).send('departures');
});

app.get('/arrivals', (req, res) => {
    res.status(200).send('arrivals');
});

const port = 3001;
app.listen(process.env.PORT || port, () => { });

module.exports = app;
