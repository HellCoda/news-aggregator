-- Migration: Add image and excerpt support to articles table
-- Date: 2024-12-15

-- Add image_url column to store article thumbnail/featured image
ALTER TABLE articles ADD COLUMN image_url VARCHAR(500);

-- Add excerpt column to store first paragraphs or summary
ALTER TABLE articles ADD COLUMN excerpt TEXT;

-- Add description column to replace/complement summary
ALTER TABLE articles ADD COLUMN description TEXT;

-- Update existing articles to generate excerpts from content
UPDATE articles 
SET excerpt = CASE 
    WHEN summary IS NOT NULL AND LENGTH(summary) > 0 THEN summary
    WHEN content IS NOT NULL AND LENGTH(content) > 0 THEN SUBSTR(content, 1, 500)
    ELSE NULL
END
WHERE excerpt IS NULL;

-- Create index for faster searches including new fields
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles(title, excerpt, description);