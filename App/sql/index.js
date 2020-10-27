const { resolveInclude } = require("ejs");

const sql = {}

sql.query = {

    // User Log In 
    retrieve_user: 'SELECT c.email, c.firstName, c.lastName, c.address FROM caretaker c INNER JOIN petowner p ON c.email=p.email WHERE c.email=$1 AND c.password=$2',
   
    //Caretakers
    create_care_taker: 'INSERT INTO caretaker (email, password, firstName, lastName, address) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    retrieve_full_info: 'SELECT c.email, c.firstName, c.lastName, c.address, c.dateOfCreation, c.password, c.accountType FROM caretakers c',
    create_full_time_care_taker: 'INSERT INTO fulltimer (email) VALUES ($1) RETURNING *',
    retrieve_fulltimer: 'SELECT c.email, c.firstName, c.lastName, c.address, c.dateOfCreation, c.password, "fulltimer" AS accountType FROM caretakers c WHERE exists (SELECT f.email FROM fulltimer WHERE f.email = c.email) LIMIT 50',
    create_part_time_care_taker: 'INSERT INTO parttimer (email) VALUES ($1) RETURNING *',
    retrieve_parttimer: 'SELECT c.email, c.firstName, c.lastName, c.address, c.dateOfCreation, c.password, "parttimer" AS accountType FROM caretakers c WHERE exists (SELECT f.email FROM fulltimer WHERE f.email = c.email) LIMIT 50',

    //PetOwners
    create_pet_owner: ' INSERT INTO petowner (email, password, firstName, lastName, address) VALUES ($1,$2,$3,$4,$5) RETURNING *;',
    retrieve_petowner: 'SELECT email, firstName, lastName, address, dateOfCreation, password, "petOwner" AS accountType FROM petOwner LIMIT 50',

    //Pet
    create_pet: 'INSERT INTO pets VALUES($1, $2, $3, $4) RETURNING * ',
    retrieve_one_pet: 'SELECT * FROM pets p WHERE p.petName = $1 AND p.petOwner = $2',
    retrieve_all_pets: 'SELECT * FROM pets',
    retrieve_pet_filter_by_owner: 'SELECT p.petName, p.petType, p.specialRequirements FROM pets p WHERE p.petOwner = $1',
    filter_by_type: 'SELECT p.petName, p.petType, p.specialRequirements FROM pets p WHERE p.petType = $1',
    filter_by_type_and_owner: 'SELECT p.petName, p.typeName, p.breedName, o.firstName, o.email FROM pets p INNER JOIN petOwner ON p.petOwner = o.email',
    delete_one: 'DELETE FROM pets p WHERE p.petName = $1 AND p.petOwner = $2',
    update_one: 'UPDATE pets p SET name = $2, typename = $4, breedname = $5, gender = $6 WHERE p.petName = $1 AND p.petOwner = $3', //inputs are oldName,newName, ownerId,typeName,breedName,gender

    //PetType
    create_petType: 'INSERT INTO petType VALUES($1,$2) RETURNING *',
    retrieve_all: 'SELECT * FROM petType ORDER BY categoryType',

    //Bids
    create_bid: 'INSERT INTO bids(petOwner, petPickUp, pet, price) VALUES($1, $2, $3, $4) RETURNING *',
    accept_bid: 'UPDATE bids SET accepted = true WHERE petOwner = $1 AND petPickUp = $2',
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