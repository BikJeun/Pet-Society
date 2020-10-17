DROP TABLE IF EXISTS serviceProvider cascade;

CREATE TABLE serviceProvider (
    staff VARCHAR(100) NOT NULL PRIMARY KEY REFERENCES caretaker,
    pickup DATETIME NOT NULL REFERENCES service,
    transport transportEnum NOT NULL,
    rating int,
    review  VARCHAR(300),
    petType VARCHAR(100) NOT NULL REFERENCES pets(petType),
);