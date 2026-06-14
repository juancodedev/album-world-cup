-- Replace FWC20 with FWC00 as first sticker in special section
-- Seed script assigns numbers 1-960 to team stickers (48 teams × 20).
-- Special stickers follow: FWC00 at 961, FWC1 at 962, ..., FWC19 at 980.
-- Section count remains 20, TOTAL_STICKERS remains 1005.

-- Step 1: Remove FWC20 (was at number 980)
DELETE FROM stickers
WHERE album_id = '00000000-0000-0000-0000-000000000001'
  AND code = 'FWC20';

-- Step 2: Shift FWC1-FWC19 one position up to free number 961.
-- Must run in DESCENDING order to avoid unique constraint violations:
--   FWC19 (979→980), FWC18 (978→979), ..., FWC1 (961→962)
UPDATE stickers SET number = 980 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC19';
UPDATE stickers SET number = 979 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC18';
UPDATE stickers SET number = 978 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC17';
UPDATE stickers SET number = 977 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC16';
UPDATE stickers SET number = 976 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC15';
UPDATE stickers SET number = 975 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC14';
UPDATE stickers SET number = 974 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC13';
UPDATE stickers SET number = 973 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC12';
UPDATE stickers SET number = 972 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC11';
UPDATE stickers SET number = 971 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC10';
UPDATE stickers SET number = 970 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC9';
UPDATE stickers SET number = 969 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC8';
UPDATE stickers SET number = 968 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC7';
UPDATE stickers SET number = 967 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC6';
UPDATE stickers SET number = 966 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC5';
UPDATE stickers SET number = 965 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC4';
UPDATE stickers SET number = 964 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC3';
UPDATE stickers SET number = 963 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC2';
UPDATE stickers SET number = 962 WHERE album_id = '00000000-0000-0000-0000-000000000001' AND code = 'FWC1';

-- Step 3: Insert FWC00 at the freed position 961
INSERT INTO stickers (album_id, number, team_id, code, rarity,
  is_special, special_attribute, sticker_type_id, image_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  961, NULL, 'FWC00', 'common',
  true, 'FWC',
  'f0000000-0000-0000-0000-000000000003',
  'https://qwlopuygvhkopgsatdcl.supabase.co/storage/v1/object/public/stickers/2026/special/FWC/0.webp'
);
