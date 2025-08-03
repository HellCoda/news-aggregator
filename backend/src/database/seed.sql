-- C:\Users\Camille\Desktop\news-aggregator\backend\src\database\seed.sql
-- Default categories
--INSERT OR IGNORE INTO categories (name, color, icon) VALUES 
--  ('Actualités', '#EF4444', 'newspaper'),
--('Technologie', '#3B82F6', 'cpu'),
--    ('Sport', '#10B981', 'trophy'),
--    ('Culture', '#8B5CF6', 'palette'),
--    ('Science', '#F59E0B', 'flask'),
--    ('Économie', '#EC4899', 'chart'),
--    ('International', '#6366F1', 'globe'),
--    ('Santé', '#14B8A6', 'heart');

-- Default user preferences
INSERT OR IGNORE INTO user_preferences (key, value) VALUES 
    ('theme', 'light'),
    ('articles_per_page', '20'),
    ('auto_mark_read', 'false'),
    ('notification_enabled', 'true'),
    ('sync_interval', '30'),
    ('language', 'fr'),
    ('compact_view', 'false'),
    ('show_images', 'true');

-- Sample sources (French news websites)
INSERT OR IGNORE INTO sources (name, url, rss_url, category_id, is_active) VALUES
    ('Le Monde', 'https://www.lemonde.fr', 'https://www.lemonde.fr/rss/une.xml', 1, 1),
    ('Le Figaro', 'https://www.lefigaro.fr', 'https://www.lefigaro.fr/rss/figaro_actualites.xml', 1, 1),
    ('01net', 'https://www.01net.com', 'https://www.01net.com/rss/info/flux-rss/flux-toutes-les-actualites/', 2, 1),
    ('L''Équipe', 'https://www.lequipe.fr', 'https://www.lequipe.fr/rss/actu_rss.xml', 3, 1),
    ('Sciences et Avenir', 'https://www.sciencesetavenir.fr', 'https://www.sciencesetavenir.fr/rss.xml', 5, 1);