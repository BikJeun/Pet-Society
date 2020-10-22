DROP TABLE IF EXISTS bids CASCADE;

CREATE TABLE bids (
    petOwner VARCHAR(100) NOT NULL REFERENCES petOwners,
    petPickUp TIMESTAMP NOT NULL REFERENCES service,
    pet VARCHAR(100) NOT NULL,
    price DECIMAL NOT NULL,
    accepted boolean default false,
    PRIMARY KEY (petOwner, petPickUp),
    FOREIGN KEY (pet, petOwner) REFERENCES pets ON DELETE CASCADE
);

DROP VIEW IF EXISTS BidsView;

CREATE VIEW BidsView AS    
	SELECT b.petOwner, b.pickUp, b.amount, b.pet,
    	CASE 
          WHEN b.accepted
          THEN 'accepted'
          WHEN NOT EXISTS (SELECT 1 FROM bids b2 WHERE b.sid = b2.sid and b.petOwner = b2.petOwner and b2.accepted)
          THEN 'pending'
          ELSE 'rejected'
        END AS status
	FROM bids b;