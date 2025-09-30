# 🗄️ Supabase Schema Migration - Fix Data Persistence

**Date**: January 30, 2025  
**Issue**: Current schema doesn't match application data structure  
**Solution**: Update Supabase schema to match application requirements

## 🎯 **New Schema Design**

### **Current Problematic Schema:**
```sql
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  quantity DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **New Application-Friendly Schema:**
```sql
CREATE TABLE locations (
  id TEXT PRIMARY KEY,  -- Allow string IDs from application
  name TEXT,
  latitude DOUBLE PRECISION,  -- More flexible than DECIMAL
  longitude DOUBLE PRECISION, -- More flexible than DECIMAL
  quantity DOUBLE PRECISION, -- More flexible than DECIMAL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 **Migration Script**

### **Step 1: Drop Existing Table**
```sql
-- Drop existing table and policies
DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
DROP POLICY IF EXISTS "Enable insert for all users" ON locations;
DROP POLICY IF EXISTS "Enable update for all users" ON locations;
DROP POLICY IF EXISTS "Enable delete for all users" ON locations;
DROP TABLE IF EXISTS locations;
```

### **Step 2: Create New Table**
```sql
-- Create new locations table with flexible schema
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  quantity DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable read access for all users" ON locations FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON locations FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON locations FOR DELETE USING (true);
```

### **Step 3: Add Indexes for Performance**
```sql
-- Add indexes for better query performance
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_locations_created_at ON locations(created_at);
```

## 🔧 **Alternative: Flexible Schema with JSONB**

### **Option 2: Ultra-Flexible Schema**
```sql
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  quantity DOUBLE PRECISION,
  -- Allow additional dynamic fields
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📋 **Migration Execution Steps**

### **Step 1: Backup Current Data (if any)**
```sql
-- Export current data before migration
COPY locations TO '/tmp/locations_backup.csv' WITH CSV HEADER;
```

### **Step 2: Execute Migration**
1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the migration script**
4. **Verify table creation**

### **Step 3: Test New Schema**
```sql
-- Test insert with application data structure
INSERT INTO locations (id, name, latitude, longitude, quantity) 
VALUES (
  'imported-123456789-abc123',
  'Test Location',
  40.7128,
  -74.0060,
  100.5
);

-- Verify data
SELECT * FROM locations;
```

## 🎯 **Benefits of New Schema**

### **✅ Application Compatibility**
- **String IDs**: Supports application-generated IDs
- **Flexible Types**: DOUBLE PRECISION handles all numeric inputs
- **No Constraints**: Removes strict DECIMAL limitations

### **✅ Performance**
- **Indexes**: Optimized for common queries
- **Flexible**: Handles various data formats
- **Scalable**: Supports large datasets

### **✅ Future-Proof**
- **JSONB Metadata**: Allows additional fields
- **Flexible Schema**: Adapts to application changes
- **No Breaking Changes**: Maintains compatibility

## 🚀 **Implementation Plan**

### **Phase 1: Schema Migration**
1. **Execute migration script** in Supabase
2. **Verify table creation** and policies
3. **Test basic insert/select** operations

### **Phase 2: Application Testing**
1. **Test data import** in preview environment
2. **Verify data persistence** after refresh
3. **Test all CRUD operations**

### **Phase 3: Production Deployment**
1. **Deploy to production** when ready
2. **Monitor for any issues**
3. **Validate full functionality**

---

**This approach fixes the root cause by aligning the database schema with the application's data structure, rather than forcing the application to conform to an incompatible schema.** 🎯
