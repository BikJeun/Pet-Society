DROP TABLE IF EXISTS fulltimer CASCADE;

CREATE TABLE fulltimer (
    email VARCHAR(100) NOT NULL ON DELETE CASCADE,
    accountType VARCHAR(20) default "Full Timer"
    PRIMARY KEY (email) REFERENCES caretaker
);