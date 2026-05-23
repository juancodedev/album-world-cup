-- Allow authenticated users to insert albums
CREATE POLICY "Authenticated users can insert albums"
  ON "public"."albums"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

-- Allow authenticated users to update albums
CREATE POLICY "Authenticated users can update albums"
  ON "public"."albums"
  FOR UPDATE
  TO "authenticated"
  USING (true);

-- Allow authenticated users to delete (soft) albums
CREATE POLICY "Authenticated users can delete albums"
  ON "public"."albums"
  FOR DELETE
  TO "authenticated"
  USING (true);
