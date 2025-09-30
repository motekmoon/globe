-- Supabase Migration: Fix data structure to match application
-- This script creates a table that accepts the exact data structure the app sends

-- Drop existing table and policies
DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
DROP POLICY IF EXISTS "Enable insert for all users" ON locations;
DROP POLICY IF EXISTS "Enable update for all users" ON locations;
DROP POLICY IF EXISTS "Enable delete for all users" ON locations;
DROP TABLE IF EXISTS locations;

-- Create new table that matches application data structure
CREATE TABLE locations (
  id TEXT PRIMARY KEY,                    -- String IDs like "imported-123456789-abc123"
  name TEXT,                             -- Location name
  latitude DOUBLE PRECISION,             -- Latitude coordinate
  longitude DOUBLE PRECISION,            -- Longitude coordinate  
  quantity DOUBLE PRECISION,             -- Quantity value
  created_at TIMESTAMP WITH TIME ZONE,   -- Timestamp from app
  updated_at TIMESTAMP WITH TIME ZONE    -- Timestamp from app
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable read access for all users" ON locations FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON locations FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON locations FOR DELETE USING (true);

-- Add indexes for performance
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_locations_created_at ON locations(created_at);

-- Test with exact data structure the app sends
INSERT INTO locations (id, name, latitude, longitude, quantity, created_at, updated_at) 
VALUES (
  'imported-1738256400000-abc123def',
  'Test Location',
  40.7128,
  -74.0060,
  100.5,
  '2025-01-30T21:26:40.000Z'::timestamp with time zone,
  '2025-01-30T21:26:40.000Z'::timestamp with time zone
);

-- Verify the data was inserted successfully
SELECT * FROM locations;
