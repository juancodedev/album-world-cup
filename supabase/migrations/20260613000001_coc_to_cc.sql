-- Rename COC sticker codes to CC prefix in stickers.code column.
-- COC section display code changes from 'COC' to 'CC' for user-facing UI.
-- Internal special_attribute remains 'COC' for filtering and image paths.
--
-- Rollback: UPDATE stickers SET code = REPLACE(code, 'CC', 'COC') WHERE special_attribute = 'COC';

UPDATE stickers
SET code = REPLACE(code, 'COC', 'CC')
WHERE special_attribute = 'COC';
