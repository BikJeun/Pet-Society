DROP TABLE IF EXISTS caretaker cascade;

CREATE TABLE caretaker (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    FOREIGN KEY (email) REFERENCES user
);