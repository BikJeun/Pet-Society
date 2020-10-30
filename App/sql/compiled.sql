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

-- Trigger to make sure ratings are made properly
CREATE OR REPLACE FUNCTION check_ratings()
RETURNS TRIGGER AS
$$ DECLARE ctx NUMERIC;
    BEGIN
        -- Ensure that ratings are done after service completes
        IF NOT EXISTS (SELECT 1 FROM bid_service b WHERE b.accepted = true AND DATEADD(day, b.duration, b.pickup_date) < CURRENT_TIMESTAMP) 
        THEN RAISE EXCEPTION 'Ratings are not allowed to be made for an ongoing service';
        RETURN NULL;
        -- Ensure ratings are between 0-5
        ELSE IF NEW.rating > 5 OR NEW.rating < 0 THEN
            RAISE EXCEPTION 'Ratings must be within 0-5.';
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rating_trigger 
BEFORE INSERT ON ratings
FOR EACH ROW EXECUTE PROCEDURE check_ratings();

-------------------------------------------------------------------------------------

--Trigger to make sure caretakers take up services they can take
CREATE OR REPLACE FUNCTION check_service()
RETURNS TRIGGER AS
$$ DECLARE ctx NUMERIC;
    BEGIN
        IF(TG_OP = 'INSERT') OR (TG_OP = 'UPDATE') THEN
            --CHECK NUMBER OF SERVICES BY CARETAKER OVERLAP
            SELECT COUNT(*) AS count
            FROM bid_service b
            WHERE b.care_taker_email <> NEW.care_taker_email
            AND b.pet_owner_email =  NEW.pet_owner_email
            AND b.pickup_date <= DATEADD(day, NEW.duration, NEW.pickup_date)
            AND NEW.pickup_time <= DATEADD(day, b.duration, b.pickup_date);
            -- CHECK IF SERVICE EXCEED (FULLTIMER)
            IF EXIST(SELECT 1 FROM fulltimer) AND count > 5 THEN
                RAISE EXCEPTION 'There is a limit of up to 5 pets at any one time';
                RETURN NULL;
            -- CHECK IF SERVICE EXCEED (PARTTIMER)
            ELSE IF EXIST(SELECT 1 FROM parttimer) AND RATINGS < 4 AND COUNT > 2 THEN
                RAISE EXCEPTION 'You cannot have moret than 2 pet at your care at any one time';
                RETURN NULL;
            ELSE IF NEW.price < 0 OR NEW.price IS NULL THEN
                RAISE EXCEPTION 'Price cannot be null or negative';
                RETRUN NULL;
            ELSE 
                RETURN NEW;
            END IF;
        END IF;
        ELSE IF (TG_OP = 'DELETE') THEN
            -- CHECK IF CARETAKER CANCELS SERVICES 1 DAY BEFORE
            IF EXISTS(SELECT 1 FROM bid_service b
                        WHERE b.care_taker_email = OLD.care_taker_email
                        AND b.accepted = true;)
                        AND OLD.pickup_time - CURRENT_TIMESTAMP < INTERVAL '1 DAY' THEN
                RAISE EXCEPTION 'You cannot cancel one day before your service time!';
                RETURN NULL;
            ELSE
                RETURN NEW;
            END IF;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bid_service_trigger
BEFORE INSERT OR UPDATE OR DELETE ON bid_service
FOR EACH ROW EXECUTE PROCEDURE check_service();
---------------------------------------------------------------
--Trigger to allow for acceptance of job immediately

CREATE OR REPLACE FUNCTION accept_bid()
RETURNS TRIGGER AS 
$$ DECLARE ctx NUMERIC;
    BEGIN 
        --FULLTIMERS WILL AUTO ACCEPT BID IF POSSIBLE
        IF EXIST(SELECT 1 FROM fulltimer f WHERE f.email = NEW.care_taker_email)
            AND SELECT COUNT(*) AS count
            FROM bid_service b
            WHERE b.care_taker_email <> NEW.care_taker_email
            AND b.pet_owner_email =  NEW.pet_owner_email
            AND b.pickup_date <= DATEADD(day, NEW.duration, NEW.pickup_date)
            AND NEW.pickup_time <= DATEADD(day, b.duration, b.pickup_date) < 5 THEN
            RAISE EXCEPTION 'Bid service accepted automatically'
            NEW.accepted = true;
            RETURN NEW;
        END IF;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_accept
BEFORE INSERT OR UPDATE ON bid_service
FOR EACH ROW EXECUTE PROCEDURE accept_bid();



---------------------------------------------------------------
--Trigger to check if leave is possible
CREATE OR REPLACE FUNCTION check_leave()
RETURNS TRIGGER AS
$$ DECLARE ctx NUMERIC;
    BEGIN
        --applying for leave during service period
        IF EXIST(SELECT 1 FROM bid_service B
                    WHERE b.care_giver_email = NEW.care_giver_email
                    AND (NEW.start_date <= b.pickup_date)
                        OR (NEW.start_date <= DATEADD(day, b.duration, b.pickup_date))
                        OR NEW.end_date >= b.pickup_date)) THEN
            RAISE EXCEPTION 'You have a job offer!';
            RETURN NULL;
        END IF;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leave_trigger
BEFORE INSERT ON leave
FOR EACH ROW EXECUTE PROCEDURE check_leave();


            
            