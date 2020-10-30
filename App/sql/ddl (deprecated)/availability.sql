DROP TABLE IF EXISTS availability;

CREATE TABLE availability (
    staff VARCHAR(100) NOT NULL REFERENCES parttimer ON DELETE CASCADE,
    date DATE NOT NOT NULL,
    time TIME NOT NULL,
    PRIMARY KEY (staff, date, time)
);