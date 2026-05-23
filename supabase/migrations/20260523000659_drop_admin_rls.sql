-- Drop RLS on admin-managed tables (auth is handled at the application level)
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE stickers DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
