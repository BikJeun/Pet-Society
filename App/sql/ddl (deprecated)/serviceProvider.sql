DROP TABLE IF EXISTS provide_service;

CREATE TYPE transportEnum AS ENUM('DELIVER', 'PICKUP', 'TRANSFER');

CREATE TABLE provide_service (
    careTakerEmail VARCHAR(100) NOT NULL,
    pickup DATETIME NOT NULL REFERENCES service,
    transport transportEnum NOT NULL,
    rating INTEGER,
    review  VARCHAR(300),
    petOwnerEmail VARCHAR(100) NOT NULL,
    petName VARCHAR(100) NOT NULL,
    pickUpDate DATE NOT NULL,
    duration INTEGER NOT NULL,
    price DECIMAL NOT NULL,
    PRIMARY KEY (petOwnerEmail, petName, pickUpDate, duration, price),
    FOREIGN KEY (petOwnerEmail, petName, pickUpDate, duration, price) REFERENCES bid_service (petOwnerEmail, petName, pickUpDate, duration, price) ON DELETE CASCADE,
    FOREIGN KEY (careTakerEmail) REFERENCES caretaker(email) ON DELETE CASCADE,
);
