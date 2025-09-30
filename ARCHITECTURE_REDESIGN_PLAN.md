# Globe App Architecture Redesign Plan

## 🎯 **Problem Analysis**

### Current Issues:
- UI interaction problems in Visualization Settings modal
- Modal layering conflicts between Import and Visualization modals
- Complex component dependencies making testing difficult
- Unclear separation of concerns between data management and visualization

### Root Cause:
- Too many different types of functionality crammed into single components
- Import modal trying to handle both basic import AND advanced visualization
- Location management scattered across multiple components
- No clear architectural boundaries

## 🏗️ **New Architecture Design**

### **3 Core Interaction Types:**

#### **1. Playback Control**
- Play/pause globe rotation
- Click and drag to rotate
- Globe interaction controls
- **Purpose**: Direct 3D globe manipulation

#### **2. Data Management**
- Import CSV/JSON files
- Template download
- **NEW: Comprehensive data management table**
  - Lists ALL records
  - Full editing capabilities
  - Complete CRUD operations
  - Bulk operations
  - Data validation

#### **3. Visualization**
- Visualization settings modal
- Column mapping
- Show/hide quantity visualization
- Preview system
- **RENAMED: "Quick Edit" drawer**
  - Only shows VISUALIZED records
  - Only shows ENABLED columns
  - Quick manipulation of displayed data
  - Lightweight, focused editing

## 🎯 **Component Autonomy Strategy**

### **Module 1: Playback Control (HIGH AUTONOMY)**
```
components/playback/
├── PlaybackControl.tsx (main component)
├── AnimationToggle.tsx
├── RotationControls.tsx
└── hooks/usePlayback.ts (isolated state)
```

### **Module 2: Data Management (HIGH AUTONOMY)**
```
components/data/
├── DataManager.tsx (comprehensive table)
├── DataImport.tsx (file import)
├── DataTable.tsx (full CRUD table)
├── DataFilters.tsx
└── hooks/useDataManager.ts (isolated state)
```

### **Module 3: Visualization (HIGH AUTONOMY)**
```
components/visualization/
├── VisualizationStudio.tsx (main component)
├── QuickEdit.tsx (renamed from Drawer)
├── VisualizationSettings.tsx
├── ColumnMapper.tsx
├── PreviewSystem.tsx
└── hooks/useVisualization.ts (isolated state)
```

## 🔧 **Implementation Phases**

### **Phase 1: Extract Data Module**
- Create `components/data/` with full data management
- Move import logic here
- Add comprehensive data table
- Isolated `useDataManager` hook

### **Phase 2: Extract Visualization Module**
- Rename `Drawer` → `QuickEdit`
- Move visualization settings here
- Isolated `useVisualization` hook
- Only shows visualized data

### **Phase 3: Clean Up App.tsx**
- App becomes pure orchestrator
- No business logic in App
- Just coordinates between modules

## 💡 **Key Autonomy Principles**

1. **Isolated State Management**
   - Each module has its own hook
   - No shared state between modules
   - Communication via props/callbacks only

2. **Clear Interfaces**
   - Each module exposes a simple API
   - No internal dependencies between modules
   - Easy to test in isolation

3. **Minimal Shared Dependencies**
   - Only share: `Location` type, basic utilities
   - No shared business logic
   - Each module is self-contained

## 🎯 **Expected Benefits**

- **Solves UI interaction problems** by giving each tool a clear purpose
- **Better UX** with both comprehensive and quick editing options
- **Cleaner architecture** with logical feature grouping
- **Easier testing** with isolated components
- **Independent development** of each module



