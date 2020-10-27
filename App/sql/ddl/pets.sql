DROP TABLE IF EXISTS pets cascade;

CREATE TABLE pets (
    petOwner VARCHAR(100) NOT NULL REFERENCES petOwner(email) ON DELETE CASCADE,
    petName VARCHAR(100) NOT NULL,
    petType VARCHAR(100) NOT NULL,
    specialRequirements VARCHAR,
    base_daily_price decimal,
    PRIMARY KEY(petOwner, petName, petType)
);
