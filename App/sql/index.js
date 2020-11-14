const { resolveInclude } = require("ejs");

const sql = {}

sql.query = {

    //Log In 
    retrieve_user_with_type: "SELECT CASE WHEN p.email IS NULL THEN a.name WHEN a.email IS NULL THEN p.name END AS name, CASE WHEN p.email IS NULL THEN a.email WHEN a.email IS NULL THEN p.email END AS email, CASE WHEN p.email IS NULL THEN a.zone WHEN a.email IS NULL THEN p.zone END AS userzone, CASE WHEN p.email IS NULL THEN 'PCSAdmin' WHEN a.email IS NULL AND f.email IS NULL THEN 'Part Timer' WHEN a.email IS NULL AND t.email IS NULL THEN 'Full Timer' END accounttype FROM caretaker c NATURAL JOIN petowner p FULL OUTER JOIN fulltimer f ON f.email = c.email FULL OUTER JOIN parttimer t ON t.email = c.email FULL OUTER JOIN PCSAdmin a ON a.email = p.email WHERE (p.email = $1 AND p.password = $2) OR (a.email = $1 AND a.password = $2)",
    
    //PCSAdmin
    create_pcs_admin: 'INSERT INTO PCSAdmin (email, password, name, address, zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    update_pcs_admin_email: 'UPDATE PCSAdmin a SET a.email = $2 WHERE a.email = $1',
    update_pcs_admin_password: 'UPDATE PCSAdmin a SET a.password = $2 WHERE a.email = $1',
    update_pcs_admin_address: 'UPDATE PCSAdmin a SET a.address = $2, a.zone = $3 WHERE a.email = $1',
    update_base_price: 'UPDATE pet SET base_daily_price = $1 WHERE pet_type = $2',

    //Caretakers
    create_care_taker: 'INSERT INTO caretaker (email, password, name, address, zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',  
    create_full_time_care_taker: 'INSERT INTO fulltimer (email) VALUES ($1) RETURNING *',
    create_part_time_care_taker: 'INSERT INTO parttimer (email) VALUES ($1) RETURNING *',
    retrieve_all_care_taker_by_zone: 'SELECT c.email, c.name, c.address, c.zone FROM caretaker c WHERE c.zone = $1 LIMIT 25',
    retrieve_all_full_time_care_taker_by_zone: 'SELECT c.email, c.name, c.address, c.zone , r.average FROM caretaker c INNER JOIN fulltimer f ON c.email = f.email LEFT OUTER JOIN (SELECT ROUND(AVG(s.rating),2) AS average, s.care_taker_email AS email FROM bid_service s GROUP BY s.care_taker_email) AS r ON r.email = c.email WHERE c.zone = $1 AND c.email <> $2 ORDER BY r.average DESC LIMIT 25',
    retrieve_all_part_time_care_taker_by_zone: 'SELECT c.email, c.name, c.address, c.zone , r.average FROM caretaker c INNER JOIN parttimer f ON c.email = f.email LEFT OUTER JOIN (SELECT ROUND(AVG(s.rating),2) AS average, s.care_taker_email AS email FROM bid_service s GROUP BY s.care_taker_email) AS r ON r.email = c.email WHERE c.zone = $1 AND c.email <> $2 ORDER BY r.average DESC LIMIT 25',
    update_care_taker_email: 'UPDATE caretaker c SET c.email = $2 WHERE c.email = $1',
    update_care_taker_password: 'UPDATE caretaker c SET c.password = $2 WHERE c.email = $1',
    update_care_taker_address: 'UPDATE caretaker c SET c.address = $2, c.zone = $3 WHERE c.email = $1',
    search_for_care_taker: "SELECT c.name, c.address, c.zone, (SELECT ROUND(AVG(s.rating),2) FROM bid_service s GROUP BY s.care_taker_email HAVING s.care_taker_email = c.email) AS averagerating, CASE WHEN EXISTS (SELECT 1 FROM parttimer WHERE email = c.email) THEN 'Part Timer' ELSE 'Full Timer' END AS type FROM caretaker c WHERE LOWER(name) LIKE LOWER($1)",

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
    retrieve_pending_bids_by_caretaker: 'SELECT * FROM bid_service WHERE accepted = false AND care_taker_email = $1 ORDER BY pickup_date ASC',
    retrieve_upcoming_success_bids_by_caretaker: 'SELECT * FROM bid_service WHERE accepted = true AND care_taker_email = $1 AND pickup_date >= CURRENT_TIMESTAMP ORDER BY pickup_date ASC',

    create_bid: 'INSERT INTO bid_service (pet_owner_email, care_taker_email, pet_name, pet_type, pickup_date, duration, price, transport_agreement) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    accept_bid: 'UPDATE bid_service SET accepted = true WHERE pet_owner_email = $1 AND care_taker_email = $2 AND pet_name = $3 AND pet_type = $4 AND pickup_date = $5 AND duration = $6 AND price = $7',
    retrieve_bid_filter_by_date_and_price: 'SELECT * FROM bid_service WHERE pickup_date = $1 ORDER BY price ASC ', //this only looks for the sepcific date
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
    retreive_bid_filter_by_month: 'SELECT * FROM bid_service b WHERE accepted = true AND EXTRACT(MONTH FROM pickup_date) = $1',
    retrieve_pending_bids: 'SELECT b.care_taker_email, b.pet_name, b.pet_type, b.pickup_date, b.duration, b.price, b.transport_agreement FROM bid_service b WHERE b.accepted = false AND b.pickup_date > CURRENT_TIMESTAMP AND b.pet_owner_email = $1 ORDER BY b.pickup_date ASC',
    retrieve_upcoming_bids: 'SELECT b.care_taker_email, b.pet_name, b.pet_type, b.pickup_date, b.duration, b.price, b.transport_agreement FROM bid_service b WHERE b.accepted = true AND b.pickup_date > CURRENT_TIMESTAMP AND b.pet_owner_email = $1 ORDER BY b.pickup_date ASC',
    retrieve_complete_bids: 'SELECT b.care_taker_email, b.pet_name, b.pet_type, b.pickup_date, b.duration, b.price, b.transport_agreement FROM bid_service b WHERE b.accepted = true AND b.pickup_date + b.duration < CURRENT_TIMESTAMP AND b.pet_owner_email = $1 ORDER BY b.pickup_date ASC',
    retrieve_complete_unrated_bids: 'SELECT b.care_taker_email, b.pet_name, b.pet_type, b.pickup_date, b.duration, b.price, b.transport_agreement FROM bid_service b WHERE b.accepted = true AND b.pickup_date + b.duration < CURRENT_TIMESTAMP AND b.pet_owner_email = $1 AND b.rating IS NULL AND b.review IS NULL ORDER BY b.pickup_date ASC',
    rate_bid: 'UPDATE bid_service SET rating = $8, review = $9 WHERE pet_owner_email = $1 AND care_taker_email = $2 AND pet_name = $3 AND pet_type = $4 AND pickup_date = $5 AND duration = $6 AND price = $7 RETURNING *',

    //Rating
    retrieve_avg_rating: 'SELECT ROUND(AVG(s.rating),2) AS average, COUNT(*) AS NUMBER FROM bid_service s GROUP BY s.care_taker_email HAVING s.care_taker_email = $1',
    retrieve_all_completed_reviews: 'SELECT * FROM bid_service WHERE care_taker_email = $1 AND rating IS NOT NULL AND review IS NOT NULL',

    //Price
    retrive_base_price_for_fulltimer: 'SELECT p.pet_type, CASE WHEN (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email = $1) >= 4 THEN (p.base_daily_price * 1.5) WHEN (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email = $1) >= 3 THEN (p.base_daily_price * 1.25) WHEN(SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email = $1)  < 3 THEN p.base_daily_price END price FROM pet p WHERE p.name = $2 AND p.pet_type = $3',
    retrieve_base_price_for_fulltimer_by_pet: 'SELECT c.name, c.address, c.email, CASE WHEN (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email = c.email) >= 4 THEN (p.base_daily_price * 1.5) WHEN (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email = c.email) >= 3 THEN (p.base_daily_price * 1.25) ELSE p.base_daily_price END price, (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email = c.email) AS rating FROM pet p, fulltimer f INNER JOIN caretaker c ON f.email = c.email WHERE p.pet_name = $1 AND p.pet_type = $2 AND c.email <> $3',
    retrieve_base_price_for_fulltimer_by_pet_no_leave: 'SELECT c.name, c.address, c.email, CASE WHEN (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email = c.email) >= 4 THEN (p.base_daily_price * 1.5) WHEN (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email = c.email) >= 3 THEN (p.base_daily_price * 1.25) ELSE p.base_daily_price END price, (SELECT ROUND(AVG(s.rating),2) FROM bid_service s WHERE s.care_taker_email = c.email) AS rating FROM pet p, fulltimer f INNER JOIN caretaker c ON f.email = c.email WHERE p.pet_name = $1 AND p.pet_type = $2 AND NOT EXISTS (SELECT 1 FROM leaves l WHERE l.fulltimer_email= c.email AND l.start_date <= DATE($3) + $4::INTEGER AND l.end_date >= $3) AND c.email <> $5',

    //CareTakerQueries
    retrieve_all_parttimer_salary_by_month: 'SELECT b.care_taker_email, SUM(b.price) * 0.75 AS salary FROM bid_service b WHERE b.accepted = true AND EXTRACT(MONTH FROM b.pickup_date)::INTEGER = $1 GROUP BY b.care_taker_email HAVING EXISTS (SELECT 1 FROM parttimer p WHERE b.care_taker_email = p.email)',
    retrieve_number_of_pet_days_for_fulltimer_monthly: 'SELECT COUNT(*) AS total_days, b.care_taker_email AS care_taker_email FROM bid_service b WHERE b.accepted = true AND EXTRACT(MONTH FROM b.pickup_date)::INTEGER = $1 GROUP BY b.care_taker_email HAVING EXISTS (SELECT 1 FROM fulltimer f WHERE b.care_taker_email = f.email)',
    retrieve_total_number_of_pet_days_current_month: 'SELECT SUM(b.duration) AS total FROM bid_service b WHERE b.care_taker_email = $1 AND b.accepted = true AND EXTRACT(MONTH FROM b.pickup_date) = EXTRACT(MONTH FROM CURRENT_TIMESTAMP)',

    //availabilities
    retrieve_all_availabilites: 'SELECT * FROM availability WHERE parttimer_email = $1 ORDER BY date ASC',
    create_availabilty: 'INSERT INTO availability VALUES ($1,$2) RETURNING *',
    retrieve_available_parttimer: '	SELECT c.email, c.name, c.address, c.zone , r.average FROM caretaker c INNER JOIN parttimer f ON c.email = f.email LEFT OUTER JOIN (SELECT ROUND(AVG(s.rating),2) AS average, s.care_taker_email AS email FROM bid_service s GROUP BY s.care_taker_email) AS r ON r.email = c.email WHERE (SELECT COUNT(*) FROM availability a WHERE a.parttimer_email = c.email AND a.date >= DATE($1) AND a.date <= DATE($1) + $2::INTEGER -1) = $2 AND c.email <> $3 ORDER BY r.average DESC',

    //leaves
    retrieve_all_leaves: 'SELECT * FROM leaves WHERE fulltimer_email = $1',
    create_leave: 'INSERT INTO leaves VALUES ($1, $2, $3, $4) RETURNING *',

    //tOTAL NUMBER OF PET (PCS ADMIN SIDE)
    retrive_total_number_of_pet_taken_care_by_month: "SELECT to_char(to_timestamp (EXTRACT(MONTH FROM b.pickup_date)::text, 'MM'), 'Month') AS month, COUNT(b.pet_type) FROM bid_service b WHERE b.accepted = true GROUP BY EXTRACT(MONTH FROM b.pickup_date) ORDER BY EXTRACT(MONTH FROM b.pickup_date)",
    

    //Month highest number of jobs
    retrieve_month_with_highest_number_of_jobs: "SELECT p.no_of_jobs AS no_of_jobs, to_char(to_timestamp (p.month::text, 'MM'), 'Month') AS month FROM ( SELECT COUNT(*) AS no_of_jobs, EXTRACT(MONTH FROM b.pickup_date) AS month FROM bid_service b WHERE b.accepted = true GROUP BY EXTRACT(MONTH FROM b.pickup_date)) AS p WHERE p.no_of_jobs >= ALL(SELECT COUNT(*) AS no_of_jobs FROM bid_service b WHERE b.accepted = true GROUP BY EXTRACT(MONTH FROM b.pickup_date))",

    //(PET OWNER SIDE)
    retrieve_all_care_taker_in_their_area: 'SELECT c.name, c.email FROM caretaker c WHERE c.zone = $1',
    retreive_other_pet_owner_nearby: 'SELECT p.name, p.email, p.address FROM petowner p WHERE p.zone = $1',
    



}

module.exports = sql;