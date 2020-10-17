DROP TABLE IF EXISTS bids CASCADE;

CREATE TABLE bids (
    petOwner VARCHAR(100) NOT NULL REFERENCES petOwners,
    petPickUp TIMESTAMP NOT NULL REFERENCES service,
    pet VARCHAR(100) NOT NULL,
    price DECIMAL NOT NULL,
    accepted boolean default false,
    PRIMARY KEY (petOwner, petPickUp),
    FOREIGN KEY (pet, petOwner) REFERENCES pets
);