<h1 align="center">Home Dashboard Train Manager </h1>
<p align="center">
    <img src="https://travis-ci.org/iamtomhewitt/home-dashboard-train-manager.svg"/>
    <img src="https://heroku-badge.herokuapp.com/?app=home-dashboard-train-manager&style=round&svg=1"/>
</p>
<p align="center">
    A Node Express app for piggy backing the api of <a href="https://github.com/jpsingleton/Huxley">Huxley</a> to get train timetables for my <a href="https://github.com/iamtomhewitt/home-dashboard">home dashboard</a>. This project basically just reformats the JSON response from Huxley into a more basic model for my dashboard.
</p>
<p align="center">🙌 Big thanks to <a href="https://github.com/jpsingleton">James Singleton</a> for making Huxley!</p>

## Pipeline
* `Travis` tests the repo using `npm test`, which runs `mocha 'tests/**/*.js' --exit`
* Once the tests pass, `Heroku` deploys the app.
* When the app is deployed, you can make requests to it [here](https://home-dashboard-train-manager.herokuapp.com/).
* You will need an API key to make requests. You can get one [here](http://realtime.nationalrail.co.uk/OpenLDBWSRegistration/Registration).

## Endpoints

### `/ (GET)`
The root endpoint, returning information about the app.

#### Responses
* `200` success
```json
{
    "status": "🚂 SERVER OK",
    "version": "1.0.0",
    "endpoints": [
        {
            "path": "/",
            "methods": [
                "GET"
            ]
        },
        {
            "path": "/departures",
            "methods": [
                "GET"
            ]
        },
        {
            "path": "/arrivals",
            "methods": [
                "GET"
            ]
        }
    ]
}
```

### `/departures (GET)`
* Returns all the departures for a given station. You can find the station codes [here](https://www.nationalrail.co.uk/stations_destinations/48541.aspx).
* Query parameters:
	* `stationCode=<code>`
	* `numberOfResults=<number>`
	* `apiKey=<your api key>`

#### Responses
* `200` success
```json
{
    "status": 200,
    "station": "Leeds",
    "stationCode": "LDS",
    "timetable": [
        {
            "destination": "Doncaster",
            "scheduledDepartTime": "2020-01-14T12:21:00.000Z",
            "actualDepartTime": "2020-01-14T12:21:00.000Z",
            "platform": "2C",
            "cancelled": false,
            "busReplacement": false
        },
        {
            "destination": "Bradford Forster Square",
            "scheduledDepartTime": "2020-01-14T12:42:00.000Z",
            "actualDepartTime": "2020-01-14T12:42:00.000Z",
            "platform": "3B",
            "cancelled": false,
            "busReplacement": false
        },
        {
            "destination": "London Kings Cross",
            "scheduledDepartTime": "2020-01-14T12:45:00.000Z",
            "actualDepartTime": "2020-01-14T12:45:00.000Z",
            "platform": "9",
            "cancelled": false,
            "busReplacement": false
        },
        {
            "destination": "Manchester Airport",
            "scheduledDepartTime": "2020-01-14T12:45:00.000Z",
            "actualDepartTime": "2020-01-14T12:45:00.000Z",
            "platform": "16A",
            "cancelled": false,
            "busReplacement": false
        },
        {
            "destination": "Leeds Bradford Airport (Bus)",
            "scheduledDepartTime": "2020-01-14T13:09:00.000Z",
            "actualDepartTime": "2020-01-14T13:09:00.000Z",
            "platform": null,
            "cancelled": false,
            "busReplacement": true
        }
    ]
}
```

* `400` if there was a problem with query parameters 
```json
{
    "status": 400,
    "message": "There are missing query parameters"
}
```

* `500` error
```json
{
    "status": 500,
    "message": "<error message>"
}
```

### `/arrivals (GET)`
* Returns all the arrivals for a given station. You can find the station codes [here](https://www.nationalrail.co.uk/stations_destinations/48541.aspx).
* Query parameters:
	* `stationCode=<code>`
	* `numberOfResults=<number>`
	* `apiKey=<your api key>`

#### Responses
* `200` success
```json
{
    "status": 200,
    "station": "Leeds",
    "stationCode": "LDS",
    "timetable": [
        {
            "origin": "London Kings Cross",
            "scheduledArrivalTime": "2020-01-14T12:48:00.000Z",
            "actualArrivalTime": "2020-01-14T12:48:00.000Z",
            "platform": "6",
            "cancelled": false,
            "busReplacement": false
        },
        {
            "origin": "Liverpool Lime Street",
            "scheduledArrivalTime": "2020-01-14T12:49:00.000Z",
            "actualArrivalTime": "2020-01-14T12:49:00.000Z",
            "platform": "11D",
            "cancelled": false,
            "busReplacement": false
        },
        {
            "origin": "Halifax",
            "scheduledArrivalTime": "2020-01-14T12:52:00.000Z",
            "actualArrivalTime": "2020-01-14T12:52:00.000Z",
            "platform": "8B",
            "cancelled": false,
            "busReplacement": false
        },
        {
            "origin": "Knaresborough",
            "scheduledArrivalTime": "2020-01-14T12:53:00.000Z",
            "actualArrivalTime": "2020-01-14T12:53:00.000Z",
            "platform": null,
            "cancelled": false,
            "busReplacement": false
        },
        {
            "destination": "Leeds",
            "scheduledArrivalTime": "2020-01-14T13:05:00.000Z",
            "actualArrivalTime": "2020-01-14T13:05:00.000Z",
            "platform": null,
            "cancelled": false,
            "busReplacement": true
        }
    ]
}
```

* `400` if there was a problem with query parameters 
```json
{
    "status": 400,
    "message": "There are missing query parameters"
}
```

* `500` error
```json
{
    "status": 500,
    "message": "<error message>"
}
```