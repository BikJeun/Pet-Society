DROP TABLE IF EXISTS caretaker cascade;

CREATE TABLE caretaker (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    firstName varchar(200) NOT NULL,
    lastName varchar(200) NOT NULL,
    address VARCHAR(200) NOT NULL,
    verified boolean default false,
    dateOfCreation TIMESTAMP default CURRENT_TIMESTAMP NOT NULL,
    accountType VARCHAR(20) default "Caretaker"
);