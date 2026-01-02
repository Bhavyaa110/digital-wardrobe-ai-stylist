-- Clothing items
CREATE TABLE IF NOT EXISTS clothing_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  color VARCHAR(64),
  brand VARCHAR(128),
  season VARCHAR(64),
  fabric VARCHAR(128),
  occasion VARCHAR(64),
  image_url TEXT,
  data_ai_hint VARCHAR(255),
  style_tags JSON,
  mood_tags JSON,
  pinned TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Outfits (stores items as JSON array of clothing_item IDs and snapshot)
CREATE TABLE IF NOT EXISTS outfits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  occasion VARCHAR(64),
  items JSON NOT NULL, -- array of item objects or ids
  pinned TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
