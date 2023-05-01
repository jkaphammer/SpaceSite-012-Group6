-- test
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    birthday DATE NOT NULL
);

CREATE TABLE comments(
    email VARCHAR(50) FOREIGN KEY REFERENCES users(email),
    comment VARCHAR(500) PRIMARY KEY,
    pictureDate DATE NOT NULL
);