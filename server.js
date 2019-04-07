const { Client } = require('pg');
var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors');

const URL = "postgres://REMOVED:REMOVED@REMOVED:5432/REMOVED";


var app = express();
app.use(bodyParser.json());

var server = app.listen(process.env.PORT || 1904, function() {
	var port = server.address().port;
	console.log("App running on port ", port);
});

const pg = new Client({
	//host: HOST,
	//port: PORT,
	//user: USER,
	//password: PASSWORD,
	//database: DATABASE,
	connectionString: URL,
	ssl: true
});
pg.connect();


const corsWhitelist = ['http://localhost:8080', 'http://gseabra.herokuapp.com', 'https://localhost:8080', 'https://gseabra.herokuapp.com'];
const corsOptions = {
	origin: function (origin, callback) {
		if (corsWhitelist.indexOf(origin) !== -1 || !origin) {
		  callback(null, true)
		} else {
		  callback(new Error("Not allowed by CORS."))
		}
	}
}

function handleError(res, reason, message, code) {
	res.status(code || 500).json({"error": message});
}

/**
 *	Returns all points in table pois.
 */
app.get("/api/points", cors(corsOptions), function(req, res) {
	pg.query('SELECT id, name, description, ST_X(geom) as latitude, ST_Y(geom) as longitude from pois', (err, result) => {
		if (err)
			handleError(res, err.reason, err.message, 500);
		else
			res.status(200).json(result.rows);
	})
});

app.post("/api/points", function(req, res) {
	const newPoint = req.body;
	const name = newPoint.name;
	const description = newPoint.description;
	const latitude = newPoint.latitude;
	const longitude = newPoint.longitude;

	if (!newPoint || !name || !latitude || !longitude || Number.isNaN(parseFloat(latitude)) || 
	  Number.isNaN(parseFloat(longitude)) || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
		handleError(res, "Invalid user input", "Must provide a valid name, description, latitude and longitude.", 400);
	} else {
		const geom = "POINT(" + latitude + " " + longitude + ")";
		const query = "INSERT INTO pois(name, description, geom) VALUES($1, $2, ST_GeomFromText($3, 3857))";
		const values = [name, description, geom];

		pg.query(query, values, (err, result) => {
			if (err) {
				handleError(res, err.reason, err.message, 500);
			} else
				res.status(200).json(result.rows);
		})
	}
});

app.delete("/api/points/:id", function(req, res) {
	const id = Number(req.params.id);

	if (!id || Number.isNaN(parseFloat(id)) || !Number.isFinite(id)) {
		handleError(res, "Invalid user input", "Must provide a valid id.", 400);
		console.log(req.params);
	} else {
		const query = "DELETE FROM pois WHERE id=$1";
		const values = [id];

		pg.query(query, values, (err, result) => {
			if (err) {
				handleError(res, err.reason, err.message, 500);
			} else
				res.status(200).json(result.rows);
		})
	}
});


// 404 catch 
app.all('*', (req, res) => {
	console.log(`[TRACE] Server 404 request: ${req.originalUrl}`);
	res.status(200).send("404 - Page not found.")
});