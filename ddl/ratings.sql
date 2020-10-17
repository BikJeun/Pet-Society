DROP TABLE IF EXISTS ratings cascade;

CREATE TABLE ratings (
    owner VARCHAR(100) NOT NULL REFERENCES petOwner,
    caretaker VARCHAR(100) NOT NULL REFERENCES caretaker,
    rating int NOT NULL,
    PRIMARY KEY (owner, caretaker)
);