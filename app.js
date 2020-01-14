const express = require('express');
const bodyParser = require('body-parser');
const listEndpoints = require('express-list-endpoints');
const request = require('request');

const app = express();

const { version } = require('./package.json');

const successCode = 200;
const errorCode = 502;
const notFoundCode = 404;

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

    request(url, (err, resp) => {
        if (err) {
            res.status(errorCode).send('departures');
            return;
        }

        const today = new Date(Date.now()).toLocaleString().slice(0, 10);
        const huxleyResponse = JSON.parse(resp.body);
        const stationName = huxleyResponse.locationName;
        const timetable = [];

        if (huxleyResponse.trainServices !== null) {
            huxleyResponse.trainServices.forEach((train) => {
                const scheduledDepartTime = new Date(`${today} ${train.std}`);
                const actualDepartTime = train.etd === 'On time' ? new Date(`${today} ${train.std}`) : new Date(`${today} ${train.etd}`);

                timetable.push({
                    destination: train.destination[0].locationName,
                    scheduledDepartTime,
                    actualDepartTime,
                    platform: train.platform,
                    cancelled: train.isCancelled,
                    busReplacement: false,
                });
            });
        }

        if (huxleyResponse.busServices !== null) {
            huxleyResponse.busServices.forEach((bus) => {
                const scheduledDepartTime = new Date(`${today} ${bus.std}`);
                const actualDepartTime = scheduledDepartTime;

                timetable.push({
                    destination: bus.destination[0].locationName,
                    scheduledDepartTime,
                    actualDepartTime,
                    platform: bus.platform,
                    cancelled: false,
                    busReplacement: true,
                });
            });
        }

        const response = {
            status: successCode,
            station: stationName,
            stationCode,
            timetable,
        };

        res.status(successCode).send(response);
    });
});

app.get('/arrivals', (req, res) => {
    res.status(200).send('arrivals');
});

const port = 3001;
app.listen(process.env.PORT || port, () => { });

module.exports = app;
