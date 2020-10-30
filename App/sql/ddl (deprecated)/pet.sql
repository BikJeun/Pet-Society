DROP TABLE IF EXISTS pet cascade;

CREATE TYPE petTypeEnum AS ENUM('Dog', 'Cat', 'Rabbit', 'Guinea Pig', 'Hamster', 'Gerbil', 'Mouse', 'Chinchilla', 'Fish');

CREATE TABLE pet (
    petOwnerEmail VARCHAR(100) NOT NULL REFERENCES petOwner(email) ON DELETE CASCADE,
    petName VARCHAR(100) NOT NULL,
    petType petTypeEnum NOT NULL,
    special_requirements VARCHAR,
    base_daily_price decimal,
    PRIMARY KEY(petOwnerEmail, petName, petType)
);
