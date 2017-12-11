var express = require('express');
var router = express.Router();
const pg = require('pg');
const path = require('path');

const username = 'postgres';
const password = '4kuGanteng';
const connectionString = process.env.DATABASE_URL || 'postgres://' + username + ':' + password + '@localhost:5432/todo';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/v1/todos', (req, res, next) => {
	const results = [];

	// Grab data from http request
	const data = {text: req.body.text, complete: false};

	// Get a postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if (err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		// SQL Query -> Insert Data
		client.query('INSERT INTO items(text, complete) VALUES($1, $2)', [data.text, data.complete]);
		
		// SQL Query -> Select Data
		const query = client.query('SELECT * FROM items ORDER BY id ASC');

		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);			
		});

		// After all data is returned, close connection and return results
		query.on('end', () => {
			done();
			return res.json(results);
		});
	});
});

module.exports = router;
