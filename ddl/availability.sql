DROP TABLE IF EXISTS availability CASCADE;

CREATE TABLE availability (
    staff VARCHAR(100) NOT NULL REFERENCES parttimer,
    date DATE NOT NOT NULL,
    time TIME NOT NULL,
    PRIMARY KEY (staff, date, time)
);