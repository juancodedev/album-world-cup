-- Add missing SELECT policy for albums table
CREATE POLICY "Authenticated users can read albums"
  ON "public"."albums"
  FOR SELECT
  TO "authenticated"
  USING (true);
