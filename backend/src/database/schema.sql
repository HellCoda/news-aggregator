-- C:\Users\Camille\Desktop\news-aggregator\backend\src\database\schema.sql
-- News Aggregator Database Schema
-- SQLite Database

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL UNIQUE,
    rss_url VARCHAR(500),
    scraper_config TEXT, -- JSON config for web scraping
    category_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    sync_frequency INTEGER DEFAULT 30, -- minutes
    last_sync DATETIME,
    last_error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    description TEXT,
    excerpt TEXT,
    image_url VARCHAR(500),
    url VARCHAR(500) NOT NULL UNIQUE,
    author VARCHAR(200),
    published_date DATETIME,
    source_id INTEGER NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    is_favorite BOOLEAN DEFAULT 0,
    is_archived BOOLEAN DEFAULT 0,
    read_at DATETIME,
    favorited_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_article_id INTEGER,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    url VARCHAR(500) NOT NULL,
    author VARCHAR(200),
    published_date DATETIME,
    source_name VARCHAR(200),
    source_url VARCHAR(500),
    category_name VARCHAR(100),
    category_id INTEGER,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    tags TEXT, -- JSON array of tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (original_article_id) REFERENCES articles(id) ON DELETE SET NULL
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sync logs table for debugging
CREATE TABLE IF NOT EXISTS sync_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'partial'
    articles_found INTEGER DEFAULT 0,
    articles_new INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER,
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_source_published ON articles(source_id, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_read_created ON articles(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_favorite ON articles(is_favorite, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_articles_original ON saved_articles(original_article_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_active ON sources(is_active);
CREATE INDEX IF NOT EXISTS idx_sync_logs_source_started ON sync_logs(source_id, started_at DESC);

-- Triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_categories_timestamp 
    AFTER UPDATE ON categories
    BEGIN
        UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_sources_timestamp 
    AFTER UPDATE ON sources
    BEGIN
        UPDATE sources SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_articles_timestamp 
    AFTER UPDATE ON articles
    BEGIN
        UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_saved_articles_timestamp 
    AFTER UPDATE ON saved_articles
    BEGIN
        UPDATE saved_articles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_preferences_timestamp 
    AFTER UPDATE ON user_preferences
    BEGIN
        UPDATE user_preferences SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;