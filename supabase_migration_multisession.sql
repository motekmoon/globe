-- Supabase Multisession Migration Script
-- This handles the migration from single-session to multisession
-- Date: January 30, 2025

-- Step 1: Check if we need to migrate existing data
-- First, let's see what tables exist and their structure

-- Step 2: Drop existing tables if they exist (CAREFUL - THIS WILL DELETE DATA)
-- Only run this if you want to start fresh
-- DROP TABLE IF EXISTS locations CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS user_settings CASCADE;
-- DROP TABLE IF EXISTS project_settings CASCADE;

-- Step 3: Create new tables with proper structure
-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  auto_save BOOLEAN DEFAULT true,
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Locations table (with project_id)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  quantity DOUBLE PRECISION,
  category TEXT,
  size DOUBLE PRECISION,
  color TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  time_period TEXT,
  time_series_id UUID,
  research_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_coordinates CHECK (
    latitude BETWEEN -90 AND 90 AND 
    longitude BETWEEN -180 AND 180
  )
);

-- Project settings table
CREATE TABLE IF NOT EXISTS project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  column_mapping JSONB,
  visualization_settings JSONB,
  user_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_locations_project_id ON locations(project_id);
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_locations_research_data ON locations USING GIN(research_data);
CREATE INDEX IF NOT EXISTS idx_project_settings_project_id ON project_settings(project_id);

-- Step 5: Enable Row Level Security (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create RLS policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Create RLS policies for locations
CREATE POLICY "Users can view locations in own projects" ON locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = locations.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert locations in own projects" ON locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = locations.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update locations in own projects" ON locations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = locations.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete locations in own projects" ON locations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = locations.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Step 9: Create RLS policies for project_settings
CREATE POLICY "Users can view settings for own projects" ON project_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_settings.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert settings for own projects" ON project_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_settings.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update settings for own projects" ON project_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_settings.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete settings for own projects" ON project_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_settings.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Step 10: Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 11: Create triggers for automatic timestamps
CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at 
  BEFORE UPDATE ON locations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_settings_updated_at 
  BEFORE UPDATE ON project_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 12: Create function to initialize user settings
CREATE OR REPLACE FUNCTION initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 13: Create trigger to initialize user settings
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_settings();

-- Step 14: Verify the schema is working
SELECT 'Migration complete! Schema is ready for multisession Globe app.' as status;
