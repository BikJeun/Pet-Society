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
    duration INTEGER NOT NULL CHECK (duration > 0),
    price DECIMAL NOT NULL CHECK (price > 0),
    transport_agreement transportEnum NOT NULL,
    rating INTEGER CHECK (rating IS NULL OR (rating > 0 AND rating <= 5)),
    review VARCHAR(300),
    accepted boolean DEFAULT false,
    PRIMARY KEY (pet_owner_email, care_taker_email, pet_name, pet_type, pickup_date, duration, price),
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
    end_date DATE NOT NULL CHECK (end_date >= start_date),
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

------------- Trigger to make sure ratings are made after service -----------------
CREATE OR REPLACE FUNCTION check_rating_date()
RETURNS TRIGGER AS
$$ BEGIN
	IF (NEW.rating IS NOT NULL OR NEW.review IS NOT NULL) 
	  AND (OLD.pickup_date + OLD.duration > CURRENT_TIMESTAMP OR NEW.accepted = false) THEN
		RAISE EXCEPTION 'Service has to be accepted and completed';
		RETURN NULL;
	ELSE
		RETURN NEW;
	END IF; END; $$ 
LANGUAGE plpgsql;

CREATE TRIGGER verify_rating_trigger 
BEFORE UPDATE ON bid_service
FOR EACH ROW EXECUTE PROCEDURE check_rating_date();

-------------------------------------------------------------------------------------

-------- Trigger to make sure caretakers do not exceed their pet care limit ---------
--------------- and fulltime caretakers automatically accept all bids ---------------
CREATE OR REPLACE FUNCTION check_service()
RETURNS TRIGGER AS
$$ DECLARE ctx NUMERIC;
    DECLARE rtg NUMERIC;
    BEGIN
        SELECT COUNT(*) INTO ctx
        FROM bid_service b
        WHERE b.care_taker_email = NEW.care_taker_email
            AND b.pickup_date <= NEW.pickup_date + NEW.duration
            AND NEW.pickup_date <= b.pickup_date + b.duration;
        SELECT ROUND(AVG(s.rating),2) INTO rtg
        FROM bid_service s 
        GROUP BY s.care_taker_email 
        HAVING s.care_taker_email = NEW.care_taker_email;
        IF ctx >= 5 THEN
            RAISE EXCEPTION 'You cannot have more than 5 pet at your care at any one time';
            RETURN NULL;
        ELSEIF EXISTS (SELECT 1 FROM parttimer p WHERE p.email = NEW.care_taker_email) AND rtg < 4 AND ctx >= 2 THEN 
            RAISE EXCEPTION 'You cannot have more than 2 pet at your care at any one time';
            RETURN NULL;
        ELSEIF EXISTS (SELECT 1 FROM fulltimer f WHERE f.email = NEW.care_taker_email) THEN
            NEW.accepted = true;
            RETURN NEW;
        ELSE 
            RETURN NEW;	
        END IF; END; $$
LANGUAGE plpgsql;

CREATE TRIGGER bid_service_trigger
BEFORE INSERT ON bid_service
FOR EACH ROW EXECUTE PROCEDURE check_service();
---------------------------------------------------------------------------------------

-------------------- Trigger to check if leave is possible ----------------------------
CREATE OR REPLACE FUNCTION check_leave_possibility()
RETURNS TRIGGER AS
$$ DECLARE maxinterval INTEGER;
   DECLARE maxinterval2 INTEGER;
    BEGIN
		IF EXISTS (SELECT 1 FROM bid_service b
                    WHERE b.care_taker_email = NEW.fulltimer_email
                    AND (NEW.start_date <= b.pickup_date + b.duration) 
					AND (b.pickup_date <= NEW.end_date)) THEN
            RAISE EXCEPTION 'You have a job offer during that period';
            RETURN NULL;
		END IF;
		
		CREATE TEMP TABLE temp_leaves AS 
		SELECT *
		FROM leaves l
		WHERE l.fulltimer_email = NEW.fulltimer_email;
		
		INSERT INTO temp_leaves SELECT NEW.fulltimer_email, NEW.start_date, NEW.end_date, NEW.reason;
		
		IF EXISTS (SELECT 1 
					FROM leaves l 
					WHERE l.fulltimer_email = NEW.fulltimer_email 
						AND l.start_date <= make_date(EXTRACT(YEAR FROM DATE(NEW.start_date))::INTEGER, 1, 1) - 1 
						AND l.end_date >= make_date(EXTRACT(YEAR FROM DATE(NEW.start_date))::INTEGER, 1, 1) - 1
					) THEN
			INSERT INTO temp_leaves VALUES (NEW.fulltimer_email, make_date(EXTRACT(YEAR FROM DATE(NEW.start_date))::INTEGER, 1, 1) - 1, make_date(EXTRACT(YEAR FROM DATE(NEW.start_date))::INTEGER, 1, 1) - 1, 'nil');
		END IF;
		
		IF EXISTS (SELECT 1 
					FROM leaves l 
					WHERE l.fulltimer_email = NEW.fulltimer_email 
						AND l.start_date <= make_date(EXTRACT(YEAR FROM DATE(NEW.start_date))::INTEGER, 12, 31) + 1 
						AND l.end_date >= make_date(EXTRACT(YEAR FROM DATE(NEW.start_date))::INTEGER, 12, 31) + 1
					) THEN
			INSERT INTO temp_leaves VALUES (NEW.fulltimer_email, make_date(EXTRACT(YEAR FROM DATE(NEW.start_date))::INTEGER, 12, 31) + 1, make_date(EXTRACT(YEAR FROM DATE(NEW.start_date))::INTEGER, 12, 31) + 1, 'nil');
		END IF;
		
		SELECT MAX(p.gap) INTO maxinterval
		FROM (SELECT MIN(l2.start_date - l1.end_date) as gap, l2.start_date as leave2_start
				FROM (SELECT * 
						FROM temp_leaves l 
						WHERE EXTRACT(YEAR FROM l.start_date) = EXTRACT(YEAR FROM DATE(NEW.start_date)) 
							OR EXTRACT(YEAR FROM l.end_date) = EXTRACT(YEAR FROM DATE(NEW.start_date))
						ORDER BY l.start_date DESC ) AS l1,
					 (SELECT * 
						FROM temp_leaves l 
						WHERE EXTRACT(YEAR FROM l.start_date) = EXTRACT(YEAR FROM DATE(NEW.start_date)) 
							OR EXTRACT(YEAR FROM l.end_date) = EXTRACT(YEAR FROM DATE(NEW.start_date))
						ORDER BY l.start_date DESC ) AS l2
				WHERE l2.start_date > l1.start_date
				GROUP BY l2.start_date) AS p;
				
		SELECT p.gap INTO maxinterval2
		FROM (SELECT MIN(l2.start_date - l1.end_date) as gap, l2.start_date as leave2_start
				FROM (SELECT * 
						FROM temp_leaves l 
						WHERE EXTRACT(YEAR FROM l.start_date) = EXTRACT(YEAR FROM DATE(NEW.start_date)) 
							OR EXTRACT(YEAR FROM l.end_date) = EXTRACT(YEAR FROM DATE(NEW.start_date))
						ORDER BY l.start_date DESC ) AS l1,
					 (SELECT * 
						FROM temp_leaves l 
						WHERE EXTRACT(YEAR FROM l.start_date) = EXTRACT(YEAR FROM DATE(NEW.start_date)) 
							OR EXTRACT(YEAR FROM l.end_date) = EXTRACT(YEAR FROM DATE(NEW.start_date))
						ORDER BY l.start_date DESC ) AS l2
				WHERE l2.start_date > l1.start_date
				GROUP BY l2.start_date) AS p
		ORDER BY p.gap DESC
		OFFSET 1
		LIMIT 1;		
		
		DROP TABLE temp_leaves;
		
		IF maxinterval >= 300 OR (maxinterval >= 150 AND maxinterval2 >= 150) THEN 
			RETURN NEW;
		ELSE 
			RAISE EXCEPTION 'Cannot add leave as it violetes 2*150 day requirement';
			RETURN NULL;
		END IF;
		
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leave_trigger
BEFORE INSERT ON leaves
FOR EACH ROW EXECUTE PROCEDURE check_leave_possibility();	
---------------------------------------------------------------------------------------

            
            