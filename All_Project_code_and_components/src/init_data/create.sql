-- test
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    birthday DATE
);

DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments(
    comment VARCHAR(500) NOT NULL,
    email VARCHAR(100) NOT NULL,
    comment_date DATE NOT NULL
);

DROP TABLE IF EXISTS user_likes CASCADE;
CREATE TABLE user_likes(
    email VARCHAR(100) NOT NULL REFERENCES users(email),
    picture_url VARCHAR(200) NOT NULL
);