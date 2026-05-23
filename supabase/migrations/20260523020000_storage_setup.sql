-- Create stickers storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('stickers', 'stickers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images to stickers bucket
CREATE POLICY "Authenticated users can upload stickers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'stickers');

-- Allow public to view sticker images
CREATE POLICY "Anyone can view stickers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'stickers');

-- Allow authenticated users to update sticker images
CREATE POLICY "Authenticated users can update stickers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'stickers')
WITH CHECK (bucket_id = 'stickers');

-- Allow authenticated users to delete sticker images
CREATE POLICY "Authenticated users can delete stickers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'stickers');
