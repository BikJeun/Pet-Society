DROP TABLE IF EXISTS petType cascade;

CREATE TABLE petType (
    categoryName varchar(100) NOT NULL PRIMARY KEY,
    base_daily_price decimal
    )