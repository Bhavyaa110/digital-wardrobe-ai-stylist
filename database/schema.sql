CREATE DATABASE digital_wardrobe;
CREATE USER 'bhavya'@'localhost' IDENTIFIED BY 'abcdef';
GRANT ALL PRIVILEGES ON digital_wardrobe.* TO 'bhavya'@'localhost';
FLUSH PRIVILEGES;

USE digital_wardrobe;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
