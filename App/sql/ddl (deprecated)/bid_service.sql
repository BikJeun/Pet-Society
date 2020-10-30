DROP TABLE IF EXISTS bid_service;

CREATE TABLE bid_service (
    petOwnerEmail VARCHAR(100) NOT NULL,
    petName VARCHAR(100) NOT NULL,
    pickUpDate DATE NOT NULL,
    duration INTEGER NOT NULL,
    price DECIMAL NOT NULL,
    accepted boolean default false,
    PRIMARY KEY (petOwnerEmail, pickUpDate, petName, duration, price),
    FOREIGN KEY (petOwnerEmail, petName) REFERENCES pets (petOwnerEmail, petName) ON DELETE CASCADE
);