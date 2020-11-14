var express = require('express');
var router = express.Router();

const sql_query = require('../sql');

const { Pool } = require('pg');
const { query } = require('express');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

var errMessage = {
  err: null,
}

/* GET caretaker home page. */
router.get('/', function(req, res, next) { 
    pool.query(sql_query.query.retrieve_total_number_of_pet_days_current_month, [req.session.currentUserEmail], (err, data) => {
        petdays = data.rows[0].total;
        errMessage.err = null;
        pool.query(sql_query.query.retrieve_pending_bids_by_caretaker, [req.session.currentUserEmail], (err, data) => {
            pendingBids = data.rows;
            pool.query(sql_query.query.retrieve_upcoming_success_bids_by_caretaker, [req.session.currentUserEmail], (err, data) => {
                upcomingServices = data.rows;
                if (req.session.currentUserType == "Part Timer") {
                    pool.query(sql_query.query.retrieve_all_availabilites, [req.session.currentUserEmail], (err, data) => {
                        availability = data.rows;
                        res.render('caretakerhome', {
                            title: 'Care Taker Page',
                            currentUserEmail: req.session.currentUserEmail,
                            currentUserName: req.session.currentUserName,
                            currentUserType: req.session.currentUserType,
                            pendingBids: pendingBids,
                            upcomingServices: upcomingServices,
                            avail: availability,
                            petdays: petdays
                        })
                    })
                } else {
                    pool.query(sql_query.query.retrieve_all_leaves, [req.session.currentUserEmail], (err, data) => {
                        leaves = data.rows;
                        res.render('caretakerhome', {
                            title: 'Care Taker Page',
                            currentUserEmail: req.session.currentUserEmail,
                            currentUserName: req.session.currentUserName,
                            currentUserType: req.session.currentUserType,
                            pendingBids: pendingBids,
                            upcomingServices: upcomingServices,
                            leaves: leaves,
                            petdays: petdays
                        })
                    })
                }
            });
        })
    })
});


router.get('/acceptbid', function (req, res, next) {
    pool.query(sql_query.query.retrieve_pending_bids_by_caretaker, [req.session.currentUserEmail], (err, data) => {
        pendingBids = data.rows;
        res.render('acceptbid', {
            title: 'Add leave/availibility',
            currentUserEmail: req.session.currentUserEmail,
            currentUserName: req.session.currentUserName,
            currentUserType: req.session.currentUserType,
            pendingBids: pendingBids,
        })
    })
})

router.post('/acceptbid', function(req, res, next) {
    var no = req.body.no;
    pool.query(sql_query.query.retrieve_pending_bids_by_caretaker, [req.session.currentUserEmail], (err, data) => {
        a = data.rows[no-1];
        pool.query(sql_query.query.accept_bid, [a.pet_owner_email, a.care_taker_email, a.pet_name, a.pet_type, a.pickup_date, a.duration, a.price], (err,data) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/caretakerhome');
        })
    })

  })

router.get('/addleaveavail', function(req, res, next) {
    res.render('addleaveavail', {
        title: 'Add leave/availibility',
        currentUserEmail:  req.session.currentUserEmail,
        currentUserName: req.session.currentUserName,
        currentUserType: req.session.currentUserType,
    })
})

router.post('/addleaveavail', function(req, res, next) {
  var date1 = req.body.date1;
  var date2 = req.body.date2;
  var reason = req.body.reason;
    console.log(date1);
  if (req.session.currentUserType == 'Full Timer') {
      pool.query(sql_query.query.create_leave, [req.session.currentUserEmail, date1, date2, reason], (err, data) => {
        res.redirect('/caretakerhome');
      })
  } else {
    pool.query(sql_query.query.create_availabilty, [req.session.currentUserEmail, date1], (err, data) => {
        console.log(err);
        res.redirect('/caretakerhome');
      })
  }

})

router.get('/viewreviews', function(req, res, next) {
    pool.query(sql_query.query.retrieve_all_completed_reviews, [req.session.currentUserEmail], (err, data) => {
        if (err) {console.log(err)}
        reviews = data.rows;
        //console.log(data.rows[0].review);
        res.render('viewreviews', {
                title: 'View Reviews',
                currentUserEmail:  req.session.currentUserEmail,
                currentUserName: req.session.currentUserName,
                currentUserType: req.session.currentUserType,
                reviews: reviews
        })
    })
    
})


module.exports = router;