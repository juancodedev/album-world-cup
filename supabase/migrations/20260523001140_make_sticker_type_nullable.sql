-- Make sticker_type_id nullable in stickers (transitioning to categories)
ALTER TABLE stickers ALTER COLUMN sticker_type_id DROP NOT NULL;

-- Refresh PostgREST schema cache to recognize new columns
NOTIFY pgrst, 'reload schema';
