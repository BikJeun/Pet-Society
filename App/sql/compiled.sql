-- DO NOT SWAP ORDER (FK CONSTRAINT) --
DROP TABLE IF EXISTS PCSAdmin;
DROP TABLE IF EXISTS leaves;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS parttimer;
DROP TABLE IF EXISTS fulltimer;
DROP TABLE IF EXISTS bid_service;
DROP TABLE IF EXISTS caretaker;
DROP TABLE IF EXISTS pet;
DROP TABLE IF EXISTS creditcard;
DROP TABLE IF EXISTS petowner;

DROP TYPE IF EXISTS petTypeEnum;
DROP TYPE IF EXISTS zoneEnum;
DROP TYPE IF EXISTS transportEnum;
---------------------------------------

CREATE TYPE zoneEnum AS ENUM('North', 'South', 'East', 'West', 'Central');
CREATE TYPE transportEnum AS ENUM('DELIVER', 'PICKUP', 'TRANSFER');
CREATE TYPE petTypeEnum AS ENUM('Dog', 'Cat', 'Rabbit', 'Guinea Pig', 'Hamster', 'Gerbil', 'Mouse', 'Chinchilla', 'Fish');

CREATE TABLE petowner (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    name varchar(200) NOT NULL,
    address VARCHAR(200) NOT NULL,
    zone zoneEnum NOT NULL
);

-- Trigger to enforce covering constraint?
CREATE TABLE caretaker (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    name varchar(200) NOT NULL,
    address VARCHAR(200) NOT NULL,
    zone zoneEnum NOT NULL
);

CREATE TABLE PCSAdmin (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    name varchar(200) NOT NULL,
    address VARCHAR(200) NOT NULL,
    zone zoneEnum NOT NULL
);

CREATE TABLE parttimer (
    email VARCHAR(100) NOT NULL
    PRIMARY KEY REFERENCES caretaker(email) ON DELETE cascade
);

CREATE TABLE fulltimer (
    email VARCHAR(100) NOT NULL
    PRIMARY KEY REFERENCES caretaker(email) ON DELETE cascade
);

CREATE TABLE creditcard (
    pet_owner_email VARCHAR(100) NOT NULL REFERENCES petowner(email) ON DELETE CASCADE,
    cc_number VARCHAR(20) NOT NULL,
    cvv_code VARCHAR(3) NOT NULL,
    expiry_date DATE NOT NULL,
    PRIMARY KEY (pet_owner_email, cc_number)
);

CREATE TABLE pet (
    pet_owner_email VARCHAR(100) NOT NULL REFERENCES petowner(email) ON DELETE CASCADE,
    pet_name VARCHAR(100) NOT NULL,
    pet_type petTypeEnum NOT NULL,
    special_requirements VARCHAR,
    base_daily_price decimal,
    PRIMARY KEY (pet_owner_email, pet_name, pet_type)
);

CREATE TABLE bid_service (
    pet_owner_email VARCHAR(100) NOT NULL,
    care_taker_email VARCHAR(100) NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    pet_type petTypeEnum NOT NULL,
    pickup_date DATE NOT NULL,
    duration INTEGER NOT NULL,
    price DECIMAL NOT NULL,
    transport_agreement transportEnum NOT NULL,
    rating INTEGER,
    review VARCHAR(300),
    accepted boolean DEFAULT false,
    PRIMARY KEY (pet_owner_email, pet_name, pet_type, pickup_date, duration, price),
    FOREIGN KEY (pet_owner_email, pet_name, pet_type) REFERENCES pet (pet_owner_email, pet_name, pet_type) ON DELETE CASCADE,
    FOREIGN KEY (care_taker_email) REFERENCES caretaker(email) ON DELETE CASCADE
);

CREATE TABLE availability (
    parttimer_email VARCHAR(100) NOT NULL REFERENCES parttimer(email) ON DELETE CASCADE,
    date DATE NOT NULL,
    PRIMARY KEY (parttimer_email, date)
);

CREATE TABLE leaves (
    fulltimer_email VARCHAR(100) NOT NULL REFERENCES fulltimer(email) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(100) NOT NULL,
    PRIMARY KEY (fulltimer_email, start_date, end_date)
);

-- Trigger to make sure entry is not in fulltimer before inserting (Non-overlap) --
CREATE OR REPLACE FUNCTION not_fulltimer()
RETURNS TRIGGER AS 
$$ DECLARE ctx NUMERIC;
    BEGIN
        SELECT COUNT(*) INTO ctx FROM fulltimer f
        WHERE NEW.email = f.email;
        IF ctx > 0 THEN
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF; END; $$
LANGUAGE plpgsql;

CREATE TRIGGER check_parttimer
BEFORE INSERT ON parttimer
FOR EACH ROW EXECUTE PROCEDURE not_fulltimer();
-----------------------------------------------------------------------------------

-- Trigger to make sure entry is not in parttimer before inserting (Non-overlap) --
CREATE OR REPLACE FUNCTION not_parttimer()
RETURNS TRIGGER AS 
$$ DECLARE ctx NUMERIC;
    BEGIN
        SELECT COUNT(*) INTO ctx FROM parttimer p
        WHERE NEW.email = p.email;
        IF ctx > 0 THEN
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF; END; $$
LANGUAGE plpgsql;

CREATE TRIGGER check_fulltimer
BEFORE INSERT ON fulltimer
FOR EACH ROW EXECUTE PROCEDURE not_parttimer();
-----------------------------------------------------------------------------------
