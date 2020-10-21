const sql = {}

sql.query = {

    // User Log In and Registration
    retrieve_user: "SELECT u.email, CASE WHEN u.email = p.email THEN 'petowner' WHEN u.email = c.email THEN 'caretaker' WHEN u.email = a.email THEN 'admin' END acctype FROM users u FULL OUTER JOIN petOwner p ON u.email = p.email FULL OUTER JOIN caretaker c ON u.email = c.email FULL OUTER JOIN PCSAdmin a ON u.email = a.email WHERE u.email=$1 AND u.password=$2 AND (u.email=c.email OR u.email=p.email OR u.email=a.email)",
    create_user: 'INSERT INTO users (email, password, firstName, lastName, address) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    create_pet_owner: 'INSERT INTO petOwner (email) VALUES ($1) RETURNING *',
    create_care_taker: 'INSERT INTO caretaker (email) VALUES ($1) RETURNING *',
    create_full_time_care_taker: 'INSERT INTO fulltimer (email) VALUES ($1) RETURNING *',
    create_part_time_care_taker: 'INSERT INTO parttimer (email) VALUES ($1) RETURNING *',
    
    //To be continued



}

module.exports = sql;