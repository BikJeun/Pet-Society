var express = require('express');
var router = express.Router();

const sql_query = require('../sql');

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET log in page. */
router.get('/', function(req, res, next) {
    res.render('home', { title: 'Home Page', currentUser:  req.session.currentUserEmail});
  });

  module.exports = router;