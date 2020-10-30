DROP TABLE IF NOT EXISTS parttimer CASCADE;

CREATE TABLE parttimer (
    email VARCHAR(100) NOT NULL
    PRIMARY KEY REFERENCES caretaker(email) ON DELETE cascade
);

-- Trigger to make sure entry is not in fulltimer before inserting
CREATE OR REPLACE FUNCTION not_fulltimer()
RETURNS TRIGGER AS 
$$ DECLARE ctx NUMERIC;
    BEGIN
        SELECT COUNT(*) INTO ctx FROM fulltimer f
        WHERE NEW.email = f.email;
        IF ctx > 0 THEN
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF; END; $$
LANGUAGE plpgsql;

CREATE TRIGGER check_parttimer
BEFORE INSERT ON parttimer
FOR EACH ROW EXECUTE PROCEDURE not_fulltimer();