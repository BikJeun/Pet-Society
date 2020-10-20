var express = require('express');
var router = express.Router();

const sql_query = require('../sql');

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

var errMessage = {
  err: null,
  err2: null,
}

/* GET log in page. */
router.get('/', function(req, res, next) {
  errMessage.err = null;
  res.render('logIn', { title: 'Log In' , errMess: errMessage});
});
/* GET signup page. */

router.get('/signup', function(req, res, next) {
  errMessage.err2 = null;
  res.render('signUp', { title: 'Sign Up' , errMess: errMessage});
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
      console.log(data.rows[0].acctype); //case insensitive
      req.session.currentUserEmail = data.rows[0].email;
      res.redirect('/home');
    } else {
      errMessage.err2 = 'Invalid Login Credentials';
      console.log("unsuccessful");
      res.redirect('/');
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
  var type = req.body.chooseone;
 
  console.log("Signing Up!\nEmail: " + email + "\nPassword: " + password);
 
	pool.query(sql_query.query.create_user, [email, password, firstname, lastname, address], (err, data) => {	
      if (data.rows.length > 0) {
        console.log("New user created!");
        if (type == "petowner") { //might change to admin
          pool.query(sql_query.query.create_pet_owner, [email], (err, data) => {
            console.log(err);
          })
        } else if (type == "ftcaretaker") {
          pool.query(sql_query.query.create_care_taker, [email], (err, data) => {
            console.log(err);
          })
          pool.query(sql_query.query.create_full_time_care_taker, [email], (err, data) => {
            console.log(err);
          })
        } else if (type ==  "ptcaretaker") {
          pool.query(sql_query.query.create_care_taker, [email], (err, data) => {
            console.log(err);
          })
          pool.query(sql_query.query.create_part_time_care_taker, [email], (err, data) => {
            console.log(err);
          })
        }
        /*
        if (type == 'customer') {
          res.redirect('/home');
          req.session.currentUserEmail = data.rows[0].email;
        } else if (type =='admin') {
          res.redirect('/adminhome');
          req.session.currentUserEmail = data.rows[0].email;
        }
        */
      } else {
        console.log("Sign up unsuccessful!\nEmail already exists!");
        console.log("Type is of acc: " + type);
        errMessage.err = "Email already exists! Please use another email"
     
      }
	});
});
module.exports = router;
