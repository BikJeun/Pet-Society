DROP TABLE IF EXISTS service cascade;

CREATE TABLE service (
    pickup DATETIME NOT NULL PRIMARY KEY,
    dropoff DATETIME NOT NULL
    staff VARCHAR(100) NOT NULL REFERENCES caretaker,
);