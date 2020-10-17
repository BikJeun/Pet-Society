DROP TABLE IF EXISTS leaves CASCADE;

CREATE TABLE leaves (
    staff VARCHAR(100) NOT NULL REFERENCES fulltimer,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    reason VARCHAR(100) NOT NULL,
    PRIMARY KEY (staff, startDate, endDate)
)