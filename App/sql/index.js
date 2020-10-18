const sql = {}

sql.query = {

    // User Log In and Registration
    retrieve_user: 'SELECT * FROM users WHERE email=$1 AND password=$2',
    create_user: 'INSERT INTO users (email, password, firstName, lastName, address) VALUES ($1,$2,$3,$4,$5)',

    //To be continued



}

module.exports = sql;