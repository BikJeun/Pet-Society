var express = require('express');
var router = express.Router();

const sql_query = require('../sql');

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

var errMessage = {
  err: null,
}

/* GET home page. */
router.get('/', function(req, res, next) {
  errMessage.err = null;
  pool.query(sql_query.query.retrieve_pet_filter_by_owner, [req.session.currentUserEmail], (err, data) => {
    console.log("Error:" + err);
    console.log("\nReturn length: " + data.rowCount + "\n");
    res.render('home', { 
      title: 'Home Page', 
      currentUser:  req.session.currentUserEmail,
      pets: data.rows
    }); 
  }) 
});

/* Get add pet page */
router.get('/addPet', function(req, res, next) {
  res.render('addPet', {title: 'Add a pet', errMess: errMessage});
});


router.post("/addPet", function(req, res, next) {
  var name = req.body.name;
  var type = req.body.type;
  var specialrequirements = req.body.specialrequirements;

  pool.query(sql_query.query.create_pet, [req.session.currentUserEmail, name, type, specialrequirements], (err,data) => {
    if (err) {
      console.log("Error in adding pet...\n\n");
      console.log(err + "\n\n");
      errMessage.err = "Pet already exists!\nPlease try again";
      res.redirect('/home/addPet');
    } else {
      console.log("Add pet successful!\nName :" + data.rows[0].petname + "\n\n");
      errMessage.err = null;
      res.redirect('/home')
    }
  })
});

module.exports = router;