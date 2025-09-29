# Data Flow Analysis - Globe App

## 🔍 **DATA FLOW ANALYSIS - STEP BY STEP**

### **📥 DATA IMPORT FLOW:**

**1. Import Process:**
- User selects file in DataManager → Import tab
- `handleFileSelect()` → sets `importFile` state
- User clicks "Import Data" → `handleImport()` called
- `datasetImporter.importFromFile(importFile)` → parses CSV/JSON
- For each parsed location → `importLocations()` called
- `importLocations()` → calls `locationService.addLocation()` for each location
- `locationService.addLocation()` → **PRIMARY: IndexedDB** → **FALLBACK: localStorage**
- `setLocations(prev => [...prev, newLocation])` → updates React state
- `refreshData()` → reloads all data from storage

### **💾 DATA SAVE FLOW:**

**2. Save Process:**
- `locationService.addLocation()` called
- **Development Mode:** `indexedDBStorage.addLocation()` → IndexedDB
- **If IndexedDB fails:** Falls back to `localStorage.setItem('globe-locations')`
- **Production Mode:** Supabase database → **FALLBACK: localStorage**

### **✏️ DATA EDIT FLOW:**

**3. Edit Process:**
- `handleSaveLocation()` → `locationService.updateLocation()`
- **Development Mode:** `indexedDBStorage.updateLocation()` → IndexedDB
- **If IndexedDB fails:** Falls back to localStorage update
- `setLocations(prev => prev.map(...))` → updates React state

### **🗑️ DATA DELETE FLOW:**

**4. Delete Process:**
- `handleDeleteLocation()` → `locationService.deleteLocation()`
- **Development Mode:** `indexedDBStorage.deleteLocation()` → IndexedDB
- **If IndexedDB fails:** Falls back to localStorage filter
- `setLocations(prev => prev.filter(...))` → updates React state

### **📂 DATA LOAD FLOW:**

**5. Load Process (App Startup):**
- `useLocations()` → `useEffect()` → `locationService.getLocations()`
- **Development Mode:** `indexedDBStorage.getLocations()` → IndexedDB
- **If IndexedDB fails:** Falls back to `getStoredLocations()` from localStorage
- **Production Mode:** Supabase query → **FALLBACK: localStorage**

### **🧹 DATA PURGE BEHAVIOR:**

**6. After Purge (No Records):**
- **IndexedDB:** Empty → `getLocations()` returns `[]`
- **localStorage:** Empty → `getStoredLocations()` returns `[]`
- **React State:** `setLocations([])` → empty array
- **UI:** Shows "No locations found" message

## 🚨 **CRITICAL ISSUE IDENTIFIED:**

**The problem is in the data loading hierarchy:**

1. **App.tsx** uses `useLocations()` hook
2. **DataManager** uses `useDataManager()` hook  
3. **Both hooks call `locationService.getLocations()` independently**
4. **Both hooks maintain separate React state**
5. **When DataManager imports data, it only updates its own state**
6. **App.tsx state is NOT updated, so it still shows old data**

### **🔍 SPECIFIC BEHAVIOR AFTER PURGE:**

**If no records exist:**
- **IndexedDB:** `getLocations()` returns `[]`
- **localStorage:** `getStoredLocations()` returns `[]`  
- **App.tsx state:** `locations = []` → Globe shows no markers
- **DataManager state:** `locations = []` → Table shows "No locations found"

**But if data gets "put back":**
- **DataManager import** → updates DataManager state only
- **App.tsx state** remains empty → Globe still shows no markers
- **User sees inconsistency** between DataManager table and Globe visualization

## 🎯 **ROOT CAUSE:**
**Two separate state management systems are not synchronized!**
- `useLocations()` in App.tsx
- `useDataManager()` in DataManager
- **No communication between them**
- **Data changes in one don't update the other**

## 📋 **STORAGE HIERARCHY:**

### **Development Mode:**
1. **Primary:** IndexedDB (`GlobeLocationsDB`)
2. **Fallback:** localStorage (`globe-locations`)

### **Production Mode:**
1. **Primary:** Supabase Database
2. **Fallback:** localStorage (`globe-locations`)

## 🔧 **STATE MANAGEMENT ISSUES:**

### **App.tsx State:**
- Uses `useLocations()` hook
- Manages globe visualization data
- Loads data on app startup
- **NOT updated when DataManager changes data**

### **DataManager State:**
- Uses `useDataManager()` hook
- Manages table data independently
- Updates its own state on import/edit/delete
- **NOT synchronized with App.tsx state**

## 🚨 **SYNCHRONIZATION PROBLEM:**

**When DataManager imports data:**
1. DataManager state updates ✅
2. DataManager table shows new data ✅
3. App.tsx state remains unchanged ❌
4. Globe shows old/empty data ❌
5. **User sees inconsistent state** ❌

**When App.tsx adds location:**
1. App.tsx state updates ✅
2. Globe shows new marker ✅
3. DataManager state remains unchanged ❌
4. DataManager table shows old data ❌
5. **User sees inconsistent state** ❌

## 💡 **SOLUTION REQUIREMENTS:**

1. **Unified State Management:** Single source of truth for all location data
2. **Cross-Component Communication:** Changes in one component update all others
3. **Real-time Synchronization:** All components reflect current data state
4. **Consistent UI:** Globe and DataManager always show same data

## 📝 **FILES INVOLVED:**

- `src/App.tsx` - Main app with `useLocations()`
- `src/hooks/useLocations.ts` - App state management
- `src/components/data/DataManager.tsx` - Data management UI
- `src/hooks/useDataManager.ts` - DataManager state management
- `src/lib/supabase.ts` - Data persistence layer
- `src/lib/indexeddb.ts` - IndexedDB storage implementation

## 🎯 **NEXT STEPS:**

1. **Identify synchronization points** between components
2. **Implement cross-component communication** mechanism
3. **Ensure data consistency** across all UI components
4. **Test data flow** after changes to verify synchronization

