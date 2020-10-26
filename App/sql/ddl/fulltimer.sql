DROP TABLE IF EXISTS fulltimer CASCADE;

CREATE TABLE fulltimer (
    email VARCHAR(100) NOT NULL
    PRIMARY KEY REFERENCES caretaker ON DELETE cascade
);

-- Trigger to make sure entry is not in parttimer before inserting
CREATE OR REPLACE FUNCTION not_parttimer()
RETURNS TRIGGER AS 
$$ DECLARE ctx NUMERIC;
    BEGIN
        SELECT COUNT(*) INTO ctx FROM parttimer p
        WHERE NEW.email = p.email;
        IF ctx > 0 THEN
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF; END; $$
LANGUAGE plpgsql;

CREATE TRIGGER check_fulltimer
BEFORE INSERT ON fulltimer
FOR EACH ROW EXECUTE PROCEDURE not_parttimer();