DROP TABLE IF EXISTS service ;

CREATE TABLE service (
    pickup DATETIME NOT NULL ,
    duration INT NOT NULL,
    price DECIMAL NOT NULL,
    staff VARCHAR(100) NOT NULL REFERENCES caretaker,
    PRIMARY KEY(pickup, duration, price)
);