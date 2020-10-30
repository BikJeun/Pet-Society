const { resolveInclude } = require("ejs");

const sql = {}

sql.query = {

    //Log In 
    retrieve_user_with_type: "SELECT CASE WHEN p.email IS NULL THEN a.email WHEN a.email IS NULL THEN p.email END email, CASE WHEN p.email IS NULL THEN 'admin' WHEN a.email IS NULL THEN 'user' END accounttype FROM caretaker c NATURAL JOIN petowner p FULL OUTER JOIN PCSAdmin a ON a.email = p.email WHERE (p.email = $1 AND p.password = $2) OR (a.email = $1 AND a.password = $2)",
    
    //PCSAdmin
    create_pcs_admin: 'INSERT INTO PCSAdmin (email, password, name, address, zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    update_pcs_admin_email: 'UPDATE PCSAdmin a SET a.email = $2 WHERE a.email = $1',
    update_pcs_admin_password: 'UPDATE PCSAdmin a SET a.password = $2 WHERE a.email = $1',
    update_pcs_admin_address: 'UPDATE PCSAdmin a SET a.address = $2, a.zone = $3 WHERE a.email = $1',

    //Caretakers
    create_care_taker: 'INSERT INTO caretaker (email, password, name, address, zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',  
    create_full_time_care_taker: 'INSERT INTO fulltimer (email) VALUES ($1) RETURNING *',
    create_part_time_care_taker: 'INSERT INTO parttimer (email) VALUES ($1) RETURNING *',
    retrieve_all_care_taker_by_zone: 'SELECT c.email, c.name, c.address, c.zone, c.password FROM caretaker c WHERE c.zone = $1 LIMIT 25',
    retrieve_all_full_time_care_taker_by_zone: 'SELECT c.email, c.name, c.address, c.zone FROM caretaker c INNER JOIN fulltimer f ON c.email = f.email WHERE c.zone = $1 LIMIT 25',
    retrieve_all_part_time_care_taker_by_zone: 'SELECT c.email, c.name, c.address, c.zone FROM caretaker c INNER JOIN parttimer p ON c.email = p.email WHERE c.zone = $1 LIMIT 25',
    update_care_taker_email: 'UPDATE caretaker c SET c.email = $2 WHERE c.email = $1',
    update_care_taker_password: 'UPDATE caretaker c SET c.password = $2 WHERE c.email = $1',
    update_care_taker_address: 'UPDATE caretaker c SET c.address = $2, c.zone = $3 WHERE c.email = $1',


    //PetOwners
    create_pet_owner: 'INSERT INTO petowner (email, password, name, address, zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    retrieve_all_pet_owner_by_zone: 'SELECT email, name, address, zone FROM petowner WHERE zone = $1 LIMIT 25',
    update_pet_owner_email: 'UPDATE petowner p SET p.email = $2 WHERE p.email = $1',
    update_pet_owner_password: 'UPDATE petowner p SET p.password = $2 WHERE p.email = $1',
    update_pet_owner_address: 'UPDATE petowner p SET p.address = $2, pc.zone = $3 WHERE p.email = $1',

    //Pet
    create_pet: 'INSERT INTO pet (pet_owner_email, pet_name, pet_type, special_requirements) VALUES ($1, $2, $3, $4) RETURNING *',
    retrieve_one_pet: 'SELECT * FROM pet p WHERE p.pet_name = $1 AND p.pet_owner_email = $2 AND p.pet_type = $3',
    retrieve_all_pets: 'SELECT * FROM pet',
    retrieve_pet_filter_by_owner: 'SELECT * FROM pet p WHERE p.pet_owner_email = $1',
    retrieve_pet_filter_by_type: 'SELECT * FROM pet p WHERE p.pet_type = $1',
    retrieve_pet_filter_by_type_and_owner: 'SELECT * FROM pet p WHERE p.pet_owner_email = $1 AND p.pet_type = $2',
    // delete_one: 'DELETE FROM pet p WHERE p.petName = $1 AND p.petOwner = $2', // hold this for later on because cannot anyhow delete
    update_requirements: 'UPDATE pet p SET special_requirements = $4 WHERE p.pet_name = $1 AND p.pet_owner_email = $2 AND p.pet_type = $3',
    retrieve_pet_filter_by_base_daily_price:'SELECT * FROM pet p WHERE base_daily_price <=$1',

    //Bids
    create_bid: 'INSERT INTO bid_service (pet_owner_email, pet_name, pet_type, pickup_date, duration, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    accept_bid: 'UPDATE bid_service SET accepted = true WHERE pet_owner_email = $1 AND pet_name = $2 AND pet_type = $3 AND pickup_date = $4 AND duration = $5 AND price = $6',
    retrieve_bid_filter_by_date_and_price: 'SELECT * FROM bid_service WHERE pickup_date = $1 ORDER BY price ASC ', //SHOULD THIS BE JUST RETREIVE BY DATE?
    retrieve_bid_filter_by_accepted_status: 'SELECT * FROM bid_service WHERE accepted = "true"',
    retrieve_bid_filter_by_pending_status: 'SELECT * FROM bid_service WHERE accepted = "false"',
    retrieve_bid_filter_by_owner: 'SELECT * FROM bid_service WHERE pet_owner_email = $1 ORDER BY care_taker_email',
    retrieve_bid_filter_by_caretaker_bids: 'SELECT * FROM bid_service WHERE care_taker_email = $1',
    retrieve_all_bids: 'SELECT * FROM bid_service ORDER BY care_taker_email',
    retrieve_bid_filter_by_service_arranged_by_top_bids: 'SELECT * FROM bid_service WHERE pickup_date = $1 ORDER BY price DESC LIMIT $2',
    retrieve_bid_filter_by_transport_agreement: 'SELECT * FROM bid_service WHERE transport_agreement = $1',
    retrieve_bid_grouped_by_transport_agreement: 'SELECT * FROM bid_service GROUP BY transport_agreement',
    retrieve_care_taker_filter_by_ratings: 'SELECT b.care_taker_email FROM bid_service b WHERE ratings >= $1 ',
    retreive_review_filter_by_care_taker: 'SELECT b.review FROM bid_service b WHERE b.care_taker_email = $1',
    retreive_bid_filter_by_month: 'SELECT * FROM bid_service b WHERE accepted = "true" AND EXTRACT(MONTH FROM pickup_date) = $1',
    //cancel bid?

    //Rating
    retrieve_avg_rating: 'SELECT ROUND(AVG(s.rating),2) AS average, COUNT(*) AS NUMBER FROM bid_service s GROUP BY s.care_taker_email HAVING s.care_taker_email = $1'

    //FROM THIS POINT ON THE QUERIES ARE NOT TESTED (i'll leave it not as one line so u can check easily)

    //Price
     retrive_base_price_for_fulttimer: 'SELECT f.care_taker_email, b.pet_type, CASE WHEN (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email $1) >= 4 THEN (p.base_daily_price * 1.5) AS price WHEN (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email $1) = 3 THEN (p.base_daily_price * 1.25) AS price WHEN(SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email $1)  < 3  THEN p.base_daily_price AS price FROM (bid_service b JOIN caretaker c ON b.care_taker_email = c.email) JOIN pet p ON b.pet_type = p.pet_type WHERE c.email NOT EXIST (SELECT 1 FROM parttimer pt WHERE pt.email = c.email) UNION SELECT f.email, p.pet_type, p.base_daily_price AS price FROM fulltimer f, pet p WHERE f.email NOT EXIST(SELECT 1 FROM bid_service WHERE f.email = care_taker_email)',

    //Salary --->for total salary probably can use CTE?
    //(CARETAKER SIDE)
    retrieve_parttimer_salary: 'SELECT b.care_taker_email, SUM(0.75 * price) AS salary FROM bid_service b GROUP BY b.care_taker_email HAVING b.care_taker_email EXIST(SELECT 1 FROM parttimer p WHERE b.care_taker_email = p.email) WHERE b.accepted = "true" AND EXTRACT(MONTH FROM b.pickup_date) = $1' ,
    retrieve_number_of_pet_days_for_fulltimer_monthly: 'SELECT COUNT(*) AS number FROM bid_service GROUP BY b.care_taker_email HAVING b.care_taker_email EXIST(SELECT 1 FROM fulltimer f WHERE b.care_taker_email = f.email) WHERE b.accepted = "true" AND EXTRACT(MONTH FROM b.pickup_date) = $1',
    //INCOMPLETE --> mindblock on calculating it
    retrieve_fulltimer_salary: 'SELECT b.care_taker_email, 
    CASE
    WHEN (SELECT COUNT(*) AS number FROM bid_service GROUP BY b.care_taker_email HAVING b.care_taker_email EXIST(SELECT 1 FROM fulltimer f WHERE b.care_taker_email = f.email) WHERE b.accepted = "true" AND EXTRACT(MONTH FROM b.pickup_date) = $1 ) <= 60 THEN 3000 AS salary
    WHEN (SELECT COUNT(*) AS number FROM bid_service GROUP BY b.care_taker_email HAVING b.care_taker_email EXIST(SELECT 1 FROM fulltimer f WHERE b.care_taker_email = f.email) WHERE b.accepted = "true" AND EXTRACT(MONTH FROM b.pickup_date) = $1)  

    //tOTAL NUMBER OF PET (PCS ADMIN SIDE)
    retrive_total_number_of_pet_taken_care_in_a_month: 'SELECT COUNT(*) AS number, b.pet_type FROM bid_service b GROUP BY b.pet_type',
    
    //highest number of jobs
    retrieve_month_with_highest_number_of_jobs: 'SELECT month FROM (SELECT EXTRACT(MONTH FROM pickup_date) AS month, COUNT(*) AS number FROM bid_service GROUP BY EXTRACT(MONTH FROM pickup_date)) WHERE number = MAX(number)',

    //(PET OWNER SIDE)
    retrieve_all_care_taker_in_their_area: 'SELECT c.name, c.email FROM caretaker c WHERE c.zone = $1',
    retreive_other_pet_owner_nearby: 'SELECT p.name, p.email, p.address FROM petowner p WHERE p.zone = $1',
    



}

module.exports = sql;