const express = require('express');
const bodyParser = require('body-parser');
const listEndpoints = require('express-list-endpoints');

const app = express();

const { version } = require('./package.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send({ status: '🚂 SERVER OK', version, endpoints: listEndpoints(app) });
});

const port = 3001;
app.listen(process.env.PORT || port, () => { });

module.exports = app;
