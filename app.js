const express = require('express');
const bodyParser = require('body-parser');
const listEndpoints = require('express-list-endpoints');
const request = require('request');
const { version } = require('./package.json');

const app = express();

const successCode = 200;
const errorCode = 400;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send({ status: '🚂 SERVER OK', version, endpoints: listEndpoints(app) });
});

app.get('/departures', (req, res) => {
    const { stationCode } = req.body;
    const { apiKey } = req.body;
    const { numberOfResults } = req.body;

    let response;

    if (!stationCode || !apiKey || !numberOfResults) {
        response = {
            status: errorCode,
            message: 'There are missing parameters in the JSON payload',
        };
        res.status(errorCode).send(response);
        return;
    }

    const url = `https://huxley.apphb.com/departures/${stationCode}/${numberOfResults}?accessToken=${apiKey}`;

    request(url, (err, resp) => {
        if (err) {
            response = {
                status: errorCode,
                message: err.message,
            };
            res.status(errorCode).send(response);
            return;
        }

        if (resp.statusCode === 500) {
            response = {
                status: errorCode,
                message: `There was an error from Huxley, perhaps the station code is incorrect (you sent '${stationCode}')`,
            };
            res.status(errorCode).send(response);
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

        // Sort the timetable based on departure time so buses are not lumped at the end
        timetable.sort((a, b) => a.scheduledDepartTime.toString().localeCompare(b.scheduledDepartTime.toString()));

        response = {
            status: successCode,
            station: stationName,
            stationCode,
            timetable,
        };

        res.status(successCode).send(response);
    });
});

app.get('/arrivals', (req, res) => {
    const { stationCode } = req.body;
    const { apiKey } = req.body;
    const { numberOfResults } = req.body;

    let response;

    if (!stationCode || !apiKey || !numberOfResults) {
        response = {
            status: errorCode,
            message: 'There are missing parameters in the JSON payload',
        };
        res.status(errorCode).send(response);
        return;
    }

    const url = `https://huxley.apphb.com/arrivals/${stationCode}/${numberOfResults}?accessToken=${apiKey}`;

    request(url, (err, resp) => {
        if (err) {
            response = {
                status: errorCode,
                message: err.message,
            };
            res.status(errorCode).send(response);
            return;
        }

        if (resp.statusCode === 500) {
            response = {
                status: errorCode,
                message: `There was an error from Huxley, perhaps the station code is incorrect (you sent '${stationCode}')`,
            };
            res.status(errorCode).send(response);
            return;
        }

        const today = new Date(Date.now()).toLocaleString().slice(0, 10);
        const huxleyResponse = JSON.parse(resp.body);
        const stationName = huxleyResponse.locationName;
        const timetable = [];

        if (huxleyResponse.trainServices !== null) {
            huxleyResponse.trainServices.forEach((train) => {
                const scheduledArrivalTime = new Date(`${today} ${train.sta}`);
                const actualArrivalTime = train.eta === 'On time' ? new Date(`${today} ${train.sta}`) : new Date(`${today} ${train.eta}`);

                timetable.push({
                    origin: train.origin[0].locationName,
                    scheduledArrivalTime,
                    actualArrivalTime,
                    platform: train.platform,
                    cancelled: train.isCancelled,
                    busReplacement: false,
                });
            });
        }

        if (huxleyResponse.busServices !== null) {
            huxleyResponse.busServices.forEach((bus) => {
                const scheduledArrivalTime = new Date(`${today} ${bus.sta}`);
                const actualArrivalTime = scheduledArrivalTime;

                timetable.push({
                    destination: bus.destination[0].locationName,
                    scheduledArrivalTime,
                    actualArrivalTime,
                    platform: bus.platform,
                    cancelled: false,
                    busReplacement: true,
                });
            });
        }

        // Sort the timetable based on arrival time so buses are not lumped at the end
        timetable.sort((a, b) => a.scheduledArrivalTime.toString().localeCompare(b.scheduledArrivalTime.toString()));

        response = {
            status: successCode,
            station: stationName,
            stationCode,
            timetable,
        };

        res.status(successCode).send(response);
    });
});

const port = 3001;
app.listen(process.env.PORT || port, () => { });

module.exports = app;
