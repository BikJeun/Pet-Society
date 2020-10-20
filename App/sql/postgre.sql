--FOR REFERENCE ATM, NOT SURE HOW TO USE (WILL FIGURE OUT SOON)
/*
DROP TABLE IF EXISTS PCSAdmin cascade;

CREATE TABLE PCSAdmin (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    FOREIGN KEY (email) REFERENCES user
);

DROP TABLE IF EXISTS availability CASCADE;

CREATE TABLE availability (
    staff VARCHAR(100) NOT NULL REFERENCES parttimer,
    date DATE NOT NOT NULL,
    time TIME NOT NULL,
    PRIMARY KEY (staff, date, time)
);

DROP TABLE IF EXISTS bids CASCADE;

CREATE TABLE bids (
    petOwner VARCHAR(100) NOT NULL REFERENCES petOwners,
    petPickUp TIMESTAMP NOT NULL REFERENCES service,
    pet VARCHAR(100) NOT NULL,
    price DECIMAL NOT NULL,
    accepted boolean default false,
    PRIMARY KEY (petOwner, petPickUp),
    FOREIGN KEY (pet, petOwner) REFERENCES pets
);

  
DROP TABLE IF EXISTS caretaker cascade;

CREATE TABLE caretaker (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    FOREIGN KEY (email) REFERENCES user
);

CREATE TYPE genderEnum AS ENUM('M', 'F');
CREATE TYPE transportEnum AS ENUM('DELIVER', 'PICKUP', 'TRANSFER');

DROP TABLE IF EXISTS fulltimer CASCADE;

CREATE TABLE fulltimer (
    email VARCHAR(100) NOT NULL PRIMARY KEY REFERENCES caretaker
);

DROP TABLE IF EXISTS leaves CASCADE;

CREATE TABLE leaves (
    staff VARCHAR(100) NOT NULL REFERENCES fulltimer,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    reason VARCHAR(100) NOT NULL,
    PRIMARY KEY (staff, startDate, endDate)
)

DROP TABLE IF EXISTS petOwner cascade;

CREATE TABLE petOwner (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    FOREIGN KEY (email) REFERENCES user
);

DROP TABLE IF EXISTS pets cascade;

CREATE TABLE pets (
    petOwner VARCHAR(100) NOT NULL FOREIGN KEY REFERENCES petOwner
    petName VARCHAR(100) NOT NULL,
    petType VARCHAR(100) NOT NULL,
    gender genderEnum NOT NULL,
    specialRequirements VARCHAR(),
    base_daily_price decimal,
    PRIMARY KEY(petName, petType, gender)
);

DROP TABLE IF EXISTS ratings cascade;

CREATE TABLE ratings (
    owner VARCHAR(100) NOT NULL REFERENCES petOwner,
    caretaker VARCHAR(100) NOT NULL REFERENCES caretaker,
    rating int NOT NULL,
    PRIMARY KEY (owner, caretaker)
);

DROP TABLE IF EXISTS service cascade;

CREATE TABLE service (
    pickup DATETIME NOT NULL PRIMARY KEY,
    dropoff DATETIME NOT NULL
    staff VARCHAR(100) NOT NULL REFERENCES caretaker,
);

DROP TABLE IF EXISTS serviceProvider cascade;

CREATE TABLE serviceProvider (
    staff VARCHAR(100) NOT NULL PRIMARY KEY REFERENCES caretaker,
    pickup DATETIME NOT NULL REFERENCES service,
    transport transportEnum NOT NULL,
    rating int,
    review  VARCHAR(300),
    petType VARCHAR(100) NOT NULL REFERENCES pets(petType),
);

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    firstName varchar(200) NOT NULL,
    lastName varchar(200) NOT NULL,
    address VARCHAR(200) NOT NULL,
    verified boolean default false,
    dateOfCreation TIMESTAMP default CURRENT_TIMESTAMP NOT NULL,
); */


CREATE TABLE users (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    firstName varchar(200) NOT NULL,
    lastName varchar(200) NOT NULL,
    address VARCHAR(200) NOT NULL,
    verified boolean default false,
    dateOfCreation TIMESTAMP default CURRENT_TIMESTAMP NOT NULL,
);

CREATE OR REPLACE FUNCTION user_already_exists()
RETURNS TRIGGER AS 
$$ DECLARE ctx NUMERIC;
    BEGIN
        SELECT COUNT(*) INTO ctx FROM users U
        WHERE NEW.email = U.email;
        IF CTX > 0 THEN
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF; END; $$
LANGUAGE plpgsql;

CREATE TRIGGER check_if_exist 
BEFORE INSERT ON users
FOR EACH ROW EXECUTE PROCEDURE user_already_exists();