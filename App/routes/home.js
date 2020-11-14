var express = require('express');
var router = express.Router();

const sql_query = require('../sql');

const { Pool } = require('pg');
const { promiseImpl } = require('ejs');
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
    pool.query(sql_query.query.retrieve_all_full_time_care_taker_by_zone, [req.session.currentUserZone, req.session.currentUserEmail], (err, data) => {
      console.log(err);
      fulltimers = data.rows;
      console.log(fulltimers.length);
      pool.query(sql_query.query.retrieve_all_part_time_care_taker_by_zone, [req.session.currentUserZone, req.session.currentUserEmail], (err, data) => {
        parttimers = data.rows;
        pool.query(sql_query.query.retrieve_upcoming_bids, [req.session.currentUserEmail], (err, data) => {
          upcomingBids = data.rows;
          pool.query(sql_query.query.retrieve_pending_bids, [req.session.currentUserEmail], (err, data) => {
            pendingBids = data.rows;
            console.log(err);
            pool.query(sql_query.query.retrieve_complete_bids, [req.session.currentUserEmail], (err, data) => {
              console.log(err);
              completedBids = data.rows;               
              res.render('home', { 
                title: 'Home Page', 
                currentUserEmail:  req.session.currentUserEmail,
                currentUserName: req.session.currentUserName,
                pets: pets,
                fulltimers: fulltimers,
                parttimers: parttimers,
                upcomingBids: upcomingBids,
                pendingBids: pendingBids,
                completedBids: completedBids
              });
            })
          })
        })        
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

var bidData = {
  caretaker: null,
  pet : null,
  choice: null,
  date: null,
  duration: null
}


router.get('/makeBid', function(req, res, next) {
  pool.query(sql_query.query.retrieve_pet_filter_by_owner, [req.session.currentUserEmail], (err, data) => {
    res.render('makeBid', {title: 'Make a Bid', currentUser:  req.session.currentUserEmail, pets: pets});
  });
});

router.get('/makeBid/selectcaretaker', function(req, res, next) {
  console.log(bidData.choice);  
  res.render('bidcaretaker', {title: 'Select Caretaker', currentUserEmail:  req.session.currentUserEmail, caretaker: bidData.caretaker, type: bidData.choice});
});

router.post('/makeBid/selectcaretaker', function(req, res, next) {
  var no = req.body.no;
  var price = req.body.price;
  var agree = req.body.chooseone;

    if (bidData.choice == 1) { //fulltimer
    pool.query(sql_query.query.retrieve_base_price_for_fulltimer_by_pet_no_leave, [bidData.pet.pet_name, bidData.pet.pet_type, bidData.date, bidData.duration, req.session.currentUserEmail], (err, data) => {
      caretaker = data.rows[no-1];
      pool.query(sql_query.query.create_bid, [req.session.currentUserEmail, caretaker.email, bidData.pet.pet_name, bidData.pet.pet_type, bidData.date, bidData.duration, caretaker.price * bidData.duration, agree], (err, data) => {
        console.log("error: " + err);
        res.redirect('/home');
      })
      
    })
  } else {
    pool.query(sql_query.query.retrieve_available_parttimer, [bidData.date, bidData.duration, req.session.currentUserEmail], (err, data) => {
      caretaker = data.rows[no-1];
      pool.query(sql_query.query.create_bid, [req.session.currentUserEmail, caretaker.email, bidData.pet.pet_name, bidData.pet.pet_type, bidData.date, bidData.duration, price, agree], (err, data) => {
        console.log("error: " + err);
        res.redirect('/home');
      })
    })
  }
  
});


router.post("/makeBid", function(req, res, next) {
  var no = req.body.no;
  var type = req.body.chooseone;
  var date = req.body.date;
  var duration = req.body.duration;

  pool.query(sql_query.query.retrieve_pet_filter_by_owner, [req.session.currentUserEmail], (err, data) => {
    pet = data.rows[no - 1];
    bidData.pet = pet;
    console.log(date);
    if (type == 'fulltime') {
      pool.query(sql_query.query.retrieve_base_price_for_fulltimer_by_pet_no_leave, [pet.pet_name, pet.pet_type, date, duration, req.session.currentUserEmail], (err, data) => {
        console.log(err);
        bidData.caretaker = data.rows;
        bidData.choice = 1;
        bidData.date = date;
        bidData.duration = duration;
        res.redirect('/home/makeBid/selectcaretaker');
      })
    } else {
      pool.query(sql_query.query.retrieve_available_parttimer, [date, duration, req.session.currentUserEmail], (err, data) => {
        if (err) console.log(err);
        bidData.caretaker = data.rows;
        bidData.choice = 2;
        bidData.date = date;
        bidData.duration = duration;
        res.redirect('/home/makeBid/selectcaretaker');
      })
    }
  
  });
});

var searchData = {
  result: null
}

router.post("/searchct", function(req, res, next) {
  var name = req.body.name;

  pool.query(sql_query.query.search_for_care_taker, ['%'+ name + '%'], (err,data) => {
    if (err) {console.log(err)}
    searchData.result = data.rows;
    res.redirect('/home/searchct')
  })
});

router.get('/searchct', function(req, res, next) {  
  res.render('searchct', {title: 'Search for Caretaker', 
                          currentUserEmail:  req.session.currentUserEmail, 
                          caretaker: bidData.caretaker, 
                          result: searchData.result
                        });
});

router.get('/rateservice', function(req, res, next) {
  pool.query(sql_query.query.retrieve_complete_unrated_bids, [req.session.currentUserEmail], (err, data) => {
    res.render('rateservice', {title: 'Rate a service', currentUser:  req.session.currentUserEmail, bids: data.rows});
  });
});

router.post('/rateservice', function(req, res, next) {
  var no = req.body.no;
  var rating = parseInt(req.body.chooseone, 10)
  var review = req.body.review;

  pool.query(sql_query.query.retrieve_complete_unrated_bids, [req.session.currentUserEmail], (err, data) => {
    bid = data.rows[no-1];
    //console.log("eer: " + err);
    pool.query(sql_query.query.rate_bid, [req.session.currentUserEmail, bid.care_taker_email, bid.pet_name, bid.pet_type, bid.pickup_date, bid.duration, bid.price, rating, review],  (err, data) => {
      console.log('eRRpr:' + bid.pet_owner_email + " " + req.session.currentUserEmail + " " + bid.care_taker_email);
      res.redirect('/home')
    });
  });
});

module.exports = router;