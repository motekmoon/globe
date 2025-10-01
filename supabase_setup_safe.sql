-- Supabase Database Setup for Globe Application (Safe Version)
-- Run this in your Supabase SQL Editor
-- This version handles existing policies and tables gracefully

-- 1. Create user_metrics table for analytics
CREATE TABLE IF NOT EXISTS user_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_timestamp ON user_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_metrics_action ON user_metrics(action);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view own metrics" ON user_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON user_metrics;

-- Create RLS policies
-- Users can only see their own metrics
CREATE POLICY "Users can view own metrics" ON user_metrics
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own metrics
CREATE POLICY "Users can insert own metrics" ON user_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Update locations table to include user_id (if not already present)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Create index for user locations
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);

-- 7. Update RLS policies for locations to be user-specific
DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON locations;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON locations;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON locations;
DROP POLICY IF EXISTS "Users can view own locations" ON locations;
DROP POLICY IF EXISTS "Users can insert own locations" ON locations;
DROP POLICY IF EXISTS "Users can update own locations" ON locations;
DROP POLICY IF EXISTS "Users can delete own locations" ON locations;

-- Create new user-specific policies
CREATE POLICY "Users can view own locations" ON locations
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own locations" ON locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own locations" ON locations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own locations" ON locations
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_locations', COUNT(*),
    'total_actions', (SELECT COUNT(*) FROM user_metrics WHERE user_id = user_uuid),
    'last_activity', (SELECT MAX(timestamp) FROM user_metrics WHERE user_id = user_uuid),
    'created_at', (SELECT created_at FROM auth.users WHERE id = user_uuid)
  ) INTO result
  FROM locations 
  WHERE user_id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
