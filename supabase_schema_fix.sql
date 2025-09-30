-- Supabase Schema Fix - Auto-Generated Fields
-- This fixes the schema mismatch between app and database
-- Date: January 30, 2025

-- Step 1: Drop existing table and policies
DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
DROP POLICY IF EXISTS "Enable insert for all users" ON locations;
DROP POLICY IF EXISTS "Enable update for all users" ON locations;
DROP POLICY IF EXISTS "Enable delete for all users" ON locations;
DROP TABLE IF EXISTS locations;

-- Step 2: Create new locations table with auto-generated fields
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  quantity DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies for public access
CREATE POLICY "Enable read access for all users" ON locations FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON locations FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON locations FOR DELETE USING (true);

-- Step 5: Add indexes for better query performance
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_locations_created_at ON locations(created_at);

-- Step 6: Test the new schema with app data structure
INSERT INTO locations (name, latitude, longitude, quantity) 
VALUES (
  'Test Location',
  40.7128,
  -74.0060,
  100.5
);

-- Verify the data was inserted with auto-generated fields
SELECT * FROM locations;
