const { resolveInclude } = require("ejs");

const sql = {}

sql.query = {

    //Log In 
    retrieve_user_with_type: "SELECT CASE WHEN p.email IS NULL THEN a.email WHEN a.email IS NULL THEN p.email END email, CASE WHEN p.email IS NULL THEN 'admin' WHEN a.email IS NULL THEN 'user' END accounttype FROM caretaker c NATURAL JOIN petowner p FULL OUTER JOIN PCSAdmin a ON a.email = p.email WHERE (p.email = $1 AND p.password = $2) OR (a.email = $1 AND a.password = $2)",
    
    //PCSAdmin
    create_pcs_admin: 'INSERT INTO PCSAdmin (email, password, name, address, zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',

    //Caretakers
    create_care_taker: 'INSERT INTO caretaker (email, password, name, address, zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',  
    create_full_time_care_taker: 'INSERT INTO fulltimer (email) VALUES ($1) RETURNING *',
    create_part_time_care_taker: 'INSERT INTO parttimer (email) VALUES ($1) RETURNING *',
    retrieve_all_care_taker_by_zone: 'SELECT c.email, c.name, c.address, c.zone, c.password FROM caretaker c WHERE c.zone = $1 LIMIT 25',
    retrieve_all_full_time_care_taker_by_zone: 'SELECT c.email, c.name, c.address, c.zone FROM caretaker c INNER JOIN fulltimer f ON c.email = f.email WHERE c.zone = $1 LIMIT 25',
    retrieve_all_part_time_care_taker_by_zone: 'SELECT c.email, c.name, c.address, c.zone FROM caretaker c INNER JOIN parttimer p ON c.email = p.email WHERE c.zone = $1 LIMIT 25',

    //PetOwners
    create_pet_owner: 'INSERT INTO petowner (email, password, name, address, zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    retrieve_all_pet_owner_by_zone: 'SELECT email, name, address, zone FROM petowner WHERE zone = $1 LIMIT 25',

    //Pet
    create_pet: 'INSERT INTO pet (pet_owner_email, pet_name, pet_type, special_requirements) VALUES ($1, $2, $3, $4) RETURNING *',
    retrieve_one_pet: 'SELECT * FROM pet p WHERE p.pet_name = $1 AND p.pet_owner_email = $2 AND p.pet_type = $3',
    retrieve_all_pets: 'SELECT * FROM pet',
    retrieve_pet_filter_by_owner: 'SELECT * FROM pet p WHERE p.pet_owner_email = $1',
    retrieve_pet_filter_by_type: 'SELECT * FROM pet p WHERE p.pet_type = $1',
    retrieve_pet_filter_by_type_and_owner: 'SELECT * FROM pet p WHERE p.pet_owner_email = $1 AND p.pet_type = $2',
    // delete_one: 'DELETE FROM pet p WHERE p.petName = $1 AND p.petOwner = $2', // hold this for later on because cannot anyhow delete
    update_requirements: 'UPDATE pet p SET special_requirements = $4 WHERE p.pet_name = $1 AND p.pet_owner_email = $2 AND p.pet_type = $3',

    //Bids
    create_bid: 'INSERT INTO bid_service (pet_owner_email, pet_name, pet_type, pickup_date, duration, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    accept_bid: 'UPDATE bid_service SET accepted = true WHERE pet_owner_email = $1 AND pet_name = $2 AND pet_type = $3 AND pickup_date = $4 AND duration = $5 AND price = $6',
    retrieve_bid_filter_by_date_and_price: 'SELECT * FROM bid_service WHERE ', //STOPPED HERE

    filter_by_service: 'SELECT p.email, p.firstName, p.lastName, b.pet, b.price FROM bidsview b INNER JOIN petOwner p ON b.petOwner = p.email WHERE b.petPickUp = $1',
    filter_by_service_arranged_by_top_bids: 'SELECT p.email, p.firstName, p.lastName, b.pet, b.price FROM bidsview b INNER JOIN petOwner p ON b.petOwner = p.email WHERE b.petPickUp = $1 ORDER BY b.price DESC LIMIT $2',
    retrieve_all_bids: 'SELECT s.pickup, s.dropoff, b.pet, b.price, b.status FROM bidsview b INNER JOIN service s ON b.petPickUp = s.pickup ORDER BY s.caretaker ',
    filter_by_owner: 'SELECT s.pickup, s.dropoff, b.pet, b.price, b.status FROM bidsview b INNER JOIN service s ON b.petPickUp = s.pickup WHERE b.petOwner = $1 ORDER BY s.caretaker ',
    filter_by_caretaker_bids: 'SELECT s.pickup, s.dropoff, b.pet, b.price, b.petOwner, c.firstName, c.lastName, b.status FROM (bidsview b INNER JOIN service s ON b.petPickUp = s.pickup) INNER JOIN caretaker c ON c.email = b.petOwner WHERE S.caretaker = $1 ORDER BY s.pickup',
    filter_by_accepted_service: 'SELECT s.pickup, s.dropoff, b.pet, b.price FROM bidsview B INNER JOIN service s ON b.petPickUp = s.pickup WHERE s.caretaker = $1 AND b.status = "accepted" ',

    //Rating
    retrieve_avg_rating: 'SELECT ROUND(AVG(s.rating),2) AS average, COUNT(*) AS NUMBER FROM serviceProvider s GROUP BY staff HAVING staff = $1'






}

module.exports = sql;