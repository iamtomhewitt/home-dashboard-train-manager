const request = require('supertest');
const assert = require('assert');
require('dotenv').config();

describe('/ tests', () => {
    let server;
    const apiKey = process.env.API_KEY;

    before(() => {
        server = require('../app').listen(3002);
    });

    after(() => {
        server.close();
    });

    it('/ gives 200', (done) => {
        request(server)
            .get('/')
            .send({
                stationCode: 'LDS',
                numberOfResults: 10,
                apiKey,
            })
            .expect(200)
            .end((err, response) => {
                if (err) {
                    return done(err);
                }
                const { version } = require('../package.json');
                const status = '🚂 SERVER OK';

                assert.equal(response.body.version, version);
                assert.equal(response.body.status, status);

                return done();
            });
    });

    it('/departures gives 200', (done) => {
        request(server)
            .get(`/departures?stationCode=LDS&numberOfResults=10&apiKey=${apiKey}`)
            .expect(200)
            .end((err, response) => {
                if (err) {
                    assert.fail(err.message);
                    return done(err);
                }

                assert.notEqual(response.body.timetable, null);
                assert.equal(response.body.timetable.length, 10);
                assert.equal(response.body.stationCode, 'LDS');

                return done();
            });
    });

    it('/departures gives 400 when parameters are missing', (done) => {
        request(server)
            .get('/departures')
            .expect(400, done);
    });

    it('/departures gives 500 when using an incorrect station', (done) => {
        request(server)
            .get(`/departures?stationCode=XYZ&numberOfResults=10&apiKey=${apiKey}`)
            .expect(500, done);
    });

    it('/arrivals gives 200', (done) => {
        request(server)
            .get(`/arrivals?stationCode=LDS&numberOfResults=10&apiKey=${apiKey}`)
            .expect(200)
            .end((err, response) => {
                if (err) {
                    return done(err);
                }

                assert.notEqual(response.body.timetable, null);
                assert.equal(response.body.timetable.length, 10);
                assert.equal(response.body.stationCode, 'LDS');

                return done();
            });
    });

    it('/arrivals gives 400 when parameters are missing', (done) => {
        request(server)
            .get('/arrivals')
            .expect(400, done);
    });

    it('/arrivals gives 500 when using an incorrect station', (done) => {
        request(server)
            .get(`/arrivals?stationCode=XYZ&numberOfResults=10&apiKey=${apiKey}`)
            .expect(500, done);
    });
});
