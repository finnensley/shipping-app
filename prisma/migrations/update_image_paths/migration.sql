-- Update image paths from src/assets/ to public folder paths
UPDATE items
SET image_path = REPLACE(image_path, 'src/assets/', '/')
WHERE image_path LIKE 'src/assets/%';
