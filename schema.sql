-- Run this in your MySQL client (TablePlus, MySQL Workbench, or terminal)
-- Creates all tables needed for Fitzy Wardrobe

CREATE DATABASE IF NOT EXISTS fitzy;
USE fitzy;

CREATE TABLE IF NOT EXISTS users (
  id          VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clothing_items (
  id          VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id     VARCHAR(36)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  category    VARCHAR(50)  NOT NULL,
  color       VARCHAR(100),
  brand       VARCHAR(100),
  season      VARCHAR(50),
  fabric      VARCHAR(100),
  occasion    VARCHAR(50),
  image_url   LONGTEXT,
  data_ai_hint VARCHAR(255),
  style_tags  JSON,
  mood_tags   JSON,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outfits (
  id          VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id     VARCHAR(36)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  occasion    VARCHAR(50),
  items       JSON         NOT NULL,
  pinned      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SET GLOBAL sort_buffer_size = 256*1024;

CREATE INDEX idx_outfits_user_created ON outfits(user_id, created_at);

CREATE TABLE IF NOT EXISTS calendar_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  outfit_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_date (user_id, date)
);