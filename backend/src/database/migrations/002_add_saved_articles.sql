-- Migration: Add saved_articles table
-- This table stores permanent copies of articles that won't be deleted when sources are removed

-- Create saved_articles table
CREATE TABLE IF NOT EXISTS saved_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_article_id INTEGER, -- Reference to the original article (can be NULL if article is deleted)
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    url VARCHAR(500) NOT NULL,
    author VARCHAR(200),
    published_date DATETIME,
    
    -- Source information (stored as text to preserve even if source is deleted)
    source_name VARCHAR(200) NOT NULL,
    source_url VARCHAR(500),
    
    -- Category information
    category_name VARCHAR(100),
    category_id INTEGER, -- Can be NULL if category is deleted
    
    -- Metadata
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT, -- User can add personal notes
    tags TEXT, -- JSON array of tags
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_articles_original ON saved_articles(original_article_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_category ON saved_articles(category_id);

-- Trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_saved_articles_timestamp 
    AFTER UPDATE ON saved_articles
    BEGIN
        UPDATE saved_articles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
