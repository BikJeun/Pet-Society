DROP TABLE IF EXISTS PCSAdmin cascade;

CREATE TABLE PCSAdmin (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    firstName varchar(200) NOT NULL,
    lastName varchar(200) NOT NULL,
    address VARCHAR(200) NOT NULL,
);