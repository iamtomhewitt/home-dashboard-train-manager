const request = require('supertest');
const assert = require('assert');

describe('/ tests', () => {
    let server;

    before(() => {
        server = require('../app').listen(3002);
    });

    after(() => {
        server.close();
    });

    it('/ gives 200', (done) => {
        request(server)
            .get('/')
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
            .get('/departures')
            .send(
                {
                    stationCode: 'HRS',
                    numberOfResults: 10,
                    apiKey: 'todo',
                },
            )
            .expect(200)
            .end((err, response) => {
                if (err) {
                    assert.fail(err.message);
                    return done(err);
                }

                assert.notEqual(response.body.timetable, null);
                assert.equal(response.body.timetable.length, 10);
                assert.equal(response.body.stationCode, 'HRS');

                return done();
            });
    });

    it('/departures gives 502 when parameters are missing', (done) => {
        request(server)
            .get('/departures')
            .expect(502, done);
    });

    it('/departures gives 404 when using an incorrect station', (done) => {
        request(server)
            .get('/departures')
            .send(
                {
                    stationCode: 'XYZ',
                    numberOfResults: 10,
                    apiKey: 'todo',
                },
            )
            .expect(404, done);
    });

    it('/arrivals gives 200', (done) => {
        request(server)
            .get('/arrivals')
            .send(
                {
                    stationCode: 'HRS',
                    numberOfResults: 10,
                    apiKey: 'todo',
                },
            )
            .expect(200)
            .end((err, response) => {
                if (err) {
                    return done(err);
                }

                assert.notEqual(response.body.timetable, null);
                assert.equal(response.body.timetable.length, 10);
                assert.equal(response.body.stationCode, 'HRS');

                return done();
            });
    });

    it('/arrivals gives 502 when parameters are missing', (done) => {
        request(server)
            .get('/arrivals')
            .expect(502, done);
    });

    it('/arrivals gives 404 when using an incorrect station', (done) => {
        request(server)
            .get('/arrivals')
            .send(
                {
                    stationCode: 'XYZ',
                    numberOfResults: 10,
                    apiKey: 'todo',
                },
            )
            .expect(404, done);
    });
});
