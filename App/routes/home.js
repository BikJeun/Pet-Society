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
    pets = data.rows;
    pool.query(sql_query.query.retrieve_all_full_time_care_taker_by_zone, [req.session.currentUserZone], (err, data) => {
      fulltimers = data.rows;
      console.log(req.session.currentUserZone)
      pool.query(sql_query.query.retrieve_all_part_time_care_taker_by_zone, [req.session.currentUserZone], (err, data) => {
        parttimers = data.rows;
        res.render('home', { 
          title: 'Home Page', 
          currentUser:  req.session.currentUserEmail,
          pets: pets,
          fulltimers: fulltimers,
          parttimers: parttimers
        });
      });
    });    
  }); 
});

/* Get add pet page */
router.get('/addPet', function(req, res, next) {
  res.render('addPet', {title: 'Add a pet', errMess: errMessage});
});

/* Get update pet page */
router.get('/updatePet', function(req, res, next) {
  pool.query(sql_query.query.retrieve_pet_filter_by_owner, [req.session.currentUserEmail], (err, data) => {
    res.render('updatePet', {title: 'Update Pet', currentUser:  req.session.currentUserEmail, pets: pets});
  });
});

router.post("/updatePet", function(req, res, next) {
  var no = req.body.no;
  var specialrequirements = req.body.specialrequirements;
  pool.query(sql_query.query.retrieve_pet_filter_by_owner, [req.session.currentUserEmail], (err, data) => {
    pet = data.rows[no-1];
    console.log(pet.pet_name);
    pool.query(sql_query.query.update_requirements, [pet.pet_name, pet.pet_owner_email, pet.pet_type, specialrequirements], (err, data) => {
      console.log("requirement changed to: " + specialrequirements);
      res.redirect('/home');
    })
  });
});


router.post("/addPet", function(req, res, next) {
  var name = req.body.name;
  var type = req.body.chooseone;
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