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
  signUpError: false,
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
 
  console.log("\n\nLogging up with:\nEmail: " + email + "\nPassword: " + password);

	pool.query(sql_query.query.retrieve_user, [email, password], (err, data) => {
		if (data.rowCount > 0) {
      console.log("\n\nLog In Successful!\nEmail: " + data.rows[0].email + "\n\n");
      req.session.currentUserEmail = data.rows[0].email;
      res.redirect('/home');
    } else {
      errMessage.err2 = 'Invalid Login Credentials';
      console.log("\n\nLog In Unsuccessful\n\n");
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
 
  console.log("\n\nSigning up with:\nEmail: " + email + "\nPassword: " + password + "\n\n");
  errMessage.signUpError = false;
  
  end = () => {
    if (errMessage.signUpError == true) {
      pool.query('ROLLBACK', (err,data) => {
          console.log("Sign up unsuccessful!\nEmail already exists!\n\n");
          console.log("Calling ROLLBACK..\n\n");
          errMessage.err = "Email already exists! Please use another email";
          res.redirect('/signup');   
      });
    } else {
      pool.query('COMMIT', (err,data) => {   
        req.session.currentUserEmail = email;
        console.log('Sign Up Succesful!\nEmail: ' + req.session.currentUserEmail + "\n\n");
        res.redirect('/home');
      });
    }
  }

  pool.query('BEGIN', (err,data) => {
    if (err) {console.log(err);}
    pool.query(sql_query.query.create_pet_owner, [email, password, firstname, lastname, address], (err,data) => {
      if (err) {
        console.log('Adding to pet owner table error: ' + err.message + "\n\n");
        errMessage.signUpError = true;
      } 
      pool.query(sql_query.query.create_care_taker, [email, password, firstname, lastname, address], (err,data) => {
        if (err) {
          console.log('Adding to care taker table error: ' + err.message + "\n\n");
          errMessage.signUpError = true;
        } 
        if (type == "ptcaretaker") {
          pool.query(sql_query.query.create_part_time_care_taker, [email], (err, data) => {
            if (err) {
              console.log('Adding to part time care taker table error: ' + err.message + "\n\n");
              errMessage.signUpError = true;
            }
            end();
          })
        } else if (type == "ftcaretaker") {
          pool.query(sql_query.query.create_full_time_care_taker, [email], (err, data) => {
            if (err) {
              console.log('Adding to full time care taker table error: ' + err.message + "\n\n");
              errMessage.signUpError = true;
            }
            end();
          })
        }  
      })
    })
  });
});

module.exports = router;
