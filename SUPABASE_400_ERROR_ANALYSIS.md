# 🔍 Supabase 400 Error Analysis - Data Not Being Saved

**Date**: January 30, 2025  
**Issue**: Data import fails with 400 errors, data disappears after import  
**Environment**: Preview (https://globe-git-research-mos-projects-04ee8a86.vercel.app/)

## 🚨 **Root Cause Identified**

### **The Problem**
The application is sending data to Supabase that doesn't match the database schema, causing 400 (Bad Request) errors.

### **Schema Mismatch**
**Supabase Database Schema:**
```sql
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  latitude DECIMAL(10, 8),        -- Expected field name
  longitude DECIMAL(11, 8),       -- Expected field name  
  quantity DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Application Data Being Sent:**
```typescript
// From datasetImport.ts line 224-231
{
  id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,  // ❌ String ID instead of UUID
  name: location.name,
  latitude: location.latitude,     // ✅ Correct field name
  longitude: location.longitude,   // ✅ Correct field name
  quantity: location.quantity,
  created_at: new Date().toISOString(),  // ❌ Manual timestamp
  updated_at: new Date().toISOString()   // ❌ Manual timestamp
}
```

## 🔍 **Specific Issues Found**

### **1. ID Field Conflict**
- **Problem**: Application sends string ID (`imported-123456789-abc123`)
- **Expected**: Supabase expects UUID or no ID (auto-generated)
- **Solution**: Remove `id` field from insert data

### **2. Timestamp Fields**
- **Problem**: Application sends manual `created_at`/`updated_at`
- **Expected**: Supabase auto-generates these with `DEFAULT NOW()`
- **Solution**: Remove timestamp fields from insert data

### **3. Data Type Validation**
- **Problem**: Possible type conversion issues with coordinates
- **Expected**: `DECIMAL(10, 8)` for latitude, `DECIMAL(11, 8)` for longitude
- **Solution**: Ensure numeric values are properly formatted

## 🛠️ **Fix Required**

### **Update Supabase Insert Logic**
The `addLocation` function in `src/lib/supabase.ts` needs to:

1. **Remove ID field** - Let Supabase generate UUID
2. **Remove timestamp fields** - Let Supabase handle timestamps
3. **Validate data types** - Ensure coordinates are numbers
4. **Clean data structure** - Only send required fields

### **Current Problematic Code:**
```typescript
// Line 117-122 in supabase.ts
const { data, error } = await supabase
  .from('locations')
  .insert([location])  // ❌ Contains id, created_at, updated_at
  .select()
  .single()
```

### **Required Fix:**
```typescript
// Clean the location data before insert
const cleanLocation = {
  name: location.name,
  latitude: location.latitude,
  longitude: location.longitude,
  quantity: location.quantity
  // Remove: id, created_at, updated_at
}

const { data, error } = await supabase
  .from('locations')
  .insert([cleanLocation])  // ✅ Only required fields
  .select()
  .single()
```

## 📊 **Error Pattern Analysis**

### **Console Errors Show:**
- **Repeated 400 errors** for each location insert attempt
- **"Failed to load resource"** for `/locations` endpoint
- **"Error adding location"** with object details
- **Data appears briefly** then disappears (fallback to localStorage)

### **Why Data Disappears:**
1. **Supabase insert fails** (400 error)
2. **Fallback to localStorage** works temporarily
3. **Data refresh** queries Supabase (empty result)
4. **UI shows empty state** (no localStorage data in production)

## 🎯 **Immediate Action Required**

### **Fix the Data Structure**
1. **Clean insert data** - Remove id, timestamps
2. **Validate coordinates** - Ensure proper number types
3. **Test with single location** - Verify fix works
4. **Deploy and test** - Confirm data persistence

### **Testing Strategy**
1. **Single location test** - Add one location manually
2. **Import test** - Try small CSV import
3. **Data persistence test** - Refresh page, verify data remains
4. **Full import test** - Large dataset import

## 🔧 **Implementation Plan**

### **Step 1: Fix Supabase Insert**
- Update `addLocation` function to clean data
- Remove problematic fields
- Add data validation

### **Step 2: Test Locally**
- Test with development environment
- Verify Supabase connection
- Test data persistence

### **Step 3: Deploy Fix**
- Commit changes
- Deploy to preview
- Test in production environment

### **Step 4: Validate**
- Test data import/export
- Verify data persistence
- Confirm no more 400 errors

---

**The 400 errors are caused by schema mismatch. Fix the data structure and the data persistence will work correctly.** 🎯
