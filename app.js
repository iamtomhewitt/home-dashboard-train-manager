const express = require('express');
const bodyParser = require('body-parser');
const listEndpoints = require('express-list-endpoints');
const request = require('request');
const { version } = require('./package.json');

const app = express();

const success = 200;
const badRequest = 400;
const serverError = 500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(success).send({ status: '🚂 SERVER OK', version, endpoints: listEndpoints(app) });
});

app.get('/departures', (req, res) => {
    const { stationCode } = req.query;
    const { apiKey } = req.query;
    const { numberOfResults } = req.query;

    let response;

    if (!stationCode || !apiKey || !numberOfResults) {
        response = {
            status: badRequest,
            message: 'There are missing query parameters',
        };
        res.status(badRequest).send(response);
        return;
    }

    const url = `https://huxley.apphb.com/departures/${stationCode}/${numberOfResults}?accessToken=${apiKey}`;

    request(url, (err, resp) => {
        if (err) {
            response = {
                status: serverError,
                message: err.message,
            };
            res.status(serverError).send(response);
            return;
        }

        if (resp.statusCode === 500) {
            response = {
                status: serverError,
                message: `There was an error from Huxley, perhaps the station code is incorrect (you sent '${stationCode}')`,
            };
            res.status(serverError).send(response);
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
            status: success,
            station: stationName,
            stationCode,
            timetable,
        };

        res.status(success).send(response);
    });
});

app.get('/arrivals', (req, res) => {
    const { stationCode } = req.query;
    const { apiKey } = req.query;
    const { numberOfResults } = req.query;

    let response;

    if (!stationCode || !apiKey || !numberOfResults) {
        response = {
            status: badRequest,
            message: 'There are missing query parameters',
        };
        res.status(badRequest).send(response);
        return;
    }

    const url = `https://huxley.apphb.com/arrivals/${stationCode}/${numberOfResults}?accessToken=${apiKey}`;

    request(url, (err, resp) => {
        if (err) {
            response = {
                status: serverError,
                message: err.message,
            };
            res.status(serverError).send(response);
            return;
        }

        if (resp.statusCode === 500) {
            response = {
                status: serverError,
                message: `There was an error from Huxley, perhaps the station code is incorrect (you sent '${stationCode}')`,
            };
            res.status(serverError).send(response);
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
            status: success,
            station: stationName,
            stationCode,
            timetable,
        };

        res.status(success).send(response);
    });
});

const port = 3001;
app.listen(process.env.PORT || port, () => { });

module.exports = app;
