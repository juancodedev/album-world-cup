-- Enable RLS on teams (in case not already enabled)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage teams (admin panel)
CREATE POLICY "Authenticated users can read teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete teams"
  ON teams FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users to manage stickers (admin panel)
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read stickers"
  ON stickers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert stickers"
  ON stickers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update stickers"
  ON stickers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete stickers"
  ON stickers FOR DELETE
  TO authenticated
  USING (true);

-- Also add update + delete for categories
CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);
