DROP TABLE IF EXISTS pets cascade;

CREATE TABLE pets (
    petOwner VARCHAR(100) NOT NULL FOREIGN KEY REFERENCES petOwner ON DELETE CASCADE,
    petName VARCHAR(100) NOT NULL,
    petType VARCHAR(100) NOT NULL,
    petBreed varchar(100) NOT NULL,
    gender genderEnum NOT NULL,
    specialRequirements VARCHAR(),
    --base_daily_price decimal,
    PRIMARY KEY(petName, petType, gender)
);
