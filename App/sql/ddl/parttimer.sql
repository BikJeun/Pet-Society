DROP TABLE IF NOT EXISTS parttimer CASCADE;

CREATE TABLE parttimer (
    email VARCHAR(100) NOT NULL ON DELETE CASCADE,
    accountType VARCHAR(20) default "Part Timer"
    PRIMARY KEY (email) REFERENCES caretaker
);