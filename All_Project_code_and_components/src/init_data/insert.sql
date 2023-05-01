-- test
INSERT INTO users (name, email, password, birthday) VALUES 
('John Doe', 'johndoe@example.com', '$2a$10$YMy7d0U9vc2INCRN.vtpxez2bqVnSW/swg8soKKahTUm5Lra7BrSe', '2000-01-01'); -- password is 12345
-- ('John Deer', 'johndeer@example.com', 'HelloWorld0', '2000-01-01');

INSERT INTO comments (email, comment, pictureDate) VALUES
('johndoe@example.com', 'Heres a practice comment', '2000-01-01');
