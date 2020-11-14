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

router.get('/', function(req, res, next) {
    pool.query(sql_query.query.retrieve_month_with_highest_number_of_jobs, [], (err, data) => {
        month = data.rows[0].month;
        no_of_jobs = data.rows[0].no_of_jobs;
        pool.query(sql_query.query.retrive_total_number_of_pet_taken_care_by_month, [], (err, data) => {
            pets_taken_care = data.rows;
            res.render('adminhome', { title: 'adminhome', 
                                        currentUserName: req.session.currentUserName,
                                        month: month,
                                        no_of_jobs: no_of_jobs,
                                        pets_taken_care: pets_taken_care
                                        });

        })
    })    
  });

router.get('/createnewadmin', function(req, res, next) {
    errMessage.err = null;    
    res.render('createnewadmin', { title: 'createnewadmin', 
                                    currentUserName: req.session.currentUserName,
                                    err: errMessage.err
                                    });    
});

router.post('/createnewadmin', function(req, res, next) {
	// Retrieve Information
	var email = req.body.email;
  var password = req.body.password;
  var name = req.body.name;
  var address = req.body.address;
  var zone = req.body.choosezone;

pool.query(sql_query.query.create_pcs_admin, [email, password, name, address, zone], (err,data) => {
    if (err) {
        console.log(err);
        errMessage.err = "Email already exists! Please use another email";
        res.redirect('/adminhome/createnewadmin');  
    } else {
        res.redirect('/adminhome');
    }
})
})

router.get('/updatebaseprice', function(req, res, next) {
    errMessage.err = null;    
    res.render('updatebaseprice', { title: 'updatebaseprice', 
                                    currentUserName: req.session.currentUserName,
                                    });    
});     

    router.post('/updatebaseprice', function (req, res, next) {
        // Retrieve Information
        var name = req.body.name;
        var zone = req.body.chooseone;

        pool.query(sql_query.query.update_base_price, [name, zone], (err, data) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/adminhome');
        })


    });

module.exports = router;