var express = require('express');
var router = express.Router();

const sql_query = require('../sql');

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET log in page. */
router.get('/', function(req, res, next) {
  res.render('logIn', { title: 'Log In' });
});
/* GET signup page. */
router.get('/signup', function(req, res, next) {
  res.render('signUp', { title: 'Sign Up' });
});
 
// POST (LOG IN)
router.post('/logIn', function(req, res, next) {
	// Retrieve Information
	var email = req.body.email;
  var password = req.body.password;
 
  console.log("Email: " + email + "\nPassword: " + password);

	pool.query(sql_query.query.retrieve_user, [email, password], (err, data) => {
		if (data.rowCount > 0) {
      console.log("success");
      //res.render('home', {currentUser: data.row[0]});
    } else {
      console.log("unsuccessful");
    }
    
	});
});

// POST (SIGN UP)
router.post('/signup', function(req, res, next) {
	// Retrieve Information
	var email = req.body.email;
  var password = req.body.password;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var address = req.body.address;
 
  console.log("Signing Up!\nEmail: " + email + "\nPassword: " + password);

	pool.query(sql_query.query.create_user, [email, password, firstname, lastname, address], (err, data) => {	
      console.log("New user created!");
	});
});
module.exports = router;
