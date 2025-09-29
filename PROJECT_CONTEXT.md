# Interactive Globe Project - Context Document

## 🎯 **Project Overview**
Interactive 3D globe visualization with dynamic data mapping, quantity lines, and real-time editing capabilities. Built with React, Three.js, and Chakra UI.

## 🚀 **Critical Server Startup Procedure**

### **ALWAYS FOLLOW THIS EXACT ORDER (Port Conflicts Prevention)**

```bash
# 1. Kill ALL existing servers first
pkill -f node
lsof -ti:3000,3001,3002,3004,3005 | xargs kill -9 2>/dev/null || true

# 2. Start API Proxy Server FIRST (Port 3001)
cd /Users/zinchiang/Skip\ 4.0/api-proxy-server && npm start

# 3. Start Backend Server SECOND (Port 3002)  
cd /Users/zinchiang/Skip\ 4.0/skip-app/backend && npm start

# 4. Start Frontend LAST (Port 3000)
cd /Users/zinchiang/Skip\ 4.0/skip-app/frontend && npm run dev
```

### **Port Assignments (NEVER CHANGE)**
- **Frontend**: 3000 (auto-detects 3000, 3004, 3005+)
- **API Proxy Server**: 3001 (FIXED - handles AI requests)
- **Backend Server**: 3002 (FIXED - handles data persistence)

### **Globe Application**
- **Port**: 3003 (fallback to 3004+)
- **Start**: `cd "/Users/zinchiang/DJ HEL1X Website/interactive-globe" && PORT=3003 npm start`

## 🏗️ **Project Structure**

### **Key Directories**
- `/Users/zinchiang/Skip 4.0/` - Main Skip application
- `/Users/zinchiang/DJ HEL1X Website/interactive-globe/` - Globe application

### **Critical Files**
- `src/contexts/LocationContext.tsx` - Global state management
- `src/components/layout/Drawer.tsx` - Main UI component
- `src/components/visualization/QuantityLine.tsx` - Quantity visualization
- `src/components/visualization/QuantityMarkers.tsx` - Quantity scaling
- `src/utils/quantityScaling.ts` - Scaling algorithms
- `src/lib/supabase.ts` - Data interface definitions

## 🐛 **Common Issues & Solutions**

### **1. Double Scaling Issue (MOT-217)**
- **Problem**: QuantityLine applying scaling twice
- **Solution**: Use scaled values directly, don't divide by 50 again
- **Files**: `QuantityLine.tsx`, `quantityScaling.ts`

### **2. Column Mapping Persistence (MOT-218)**
- **Problem**: Column mapping resets on page refresh
- **Solution**: localStorage persistence in LocationContext
- **Files**: `LocationContext.tsx`

### **3. Coordinate Display Issues**
- **Problem**: Coordinates showing "N/A string"
- **Solution**: Parse string coordinates with `parseFloat()`
- **Files**: `Drawer.tsx`

### **4. Port Conflicts**
- **Problem**: Servers not starting on correct ports
- **Solution**: Always kill existing processes first, follow startup order

## 🔧 **Development Rules**

### **CRITICAL RULE #1 - NEVER CHANGE WITHOUT PERMISSION**
**NEVER change anything or write code without permission!!**
ESPECIALLY when it is:
- API configurations
- Server configurations  
- Environment files
- App.tsx files

### **CRITICAL RULE #2 - ALWAYS ASK BEFORE CODING**
- **Stop, test, and ask for user verification** before moving to next step
- **Don't say "you're absolutely right!"** unless you've checked the user is factually correct
- **For large, important, or risky tasks** - always stop and ask first

### **CRITICAL RULE #3 - SERVER STARTUP ORDER**
- **ALWAYS kill existing servers first** (pkill -f node)
- **API Proxy Server MUST be port 3001**
- **Backend Server MUST be port 3002** 
- **Frontend MUST be port 3000**
- **Globe MUST be port 3003**
- **NEVER change these port assignments**

## 🚨 **WHAT NOT TO DO (AVOID GETTING YELLED AT)**

### **❌ NEVER DO THESE THINGS**
1. **Don't change server configurations** without permission
2. **Don't modify environment files** without asking
3. **Don't touch App.tsx** without explicit permission
4. **Don't assume the user is right** - verify facts first
5. **Don't make large changes** without stopping to ask
6. **Don't skip the server startup order** - it causes port conflicts
7. **Don't create tickets** unless user says "NEW BUG" or "NEW FEAT"
8. **Don't say "you're absolutely right!"** unless you've verified it
9. **Don't make random changes** - always document and analyze first
10. **Don't skip testing** - always run `npm run build` after changes

### **✅ ALWAYS DO THESE THINGS**
1. **Ask permission** before making any code changes
2. **Follow the exact server startup order** every time
3. **Test builds** after making changes
4. **Document everything** in commits and Linear tickets
5. **Stop and ask** before moving to next major step
6. **Verify facts** before agreeing with user statements
7. **Create tickets** when user says "NEW BUG" or "NEW FEAT"
8. **Follow the bug investigation procedure** (document → analyze → identify → report)
9. **Use the established commit message format**
10. **Update Linear tickets** when issues are resolved

### **Bug Investigation Procedure**
1. **Document current state first**
2. **Analyze working version** to understand why it worked
3. **Identify exact mismatch** between what works and what's broken
4. **Create clear reports** instead of making random changes

### **Linear Integration Commands**
- **NEW BUG** → Create bug ticket in Linear
- **NEW FEAT** → Create feature ticket in Linear
- **Team**: Motekmoon
- **Labels**: Use appropriate labels (bug, feature, visualization, etc.)

### **Linear Ticket Creation Process**
1. **User says "NEW BUG"** → Create bug ticket immediately
2. **User says "NEW FEAT"** → Create feature ticket immediately  
3. **Always include**:
   - Clear problem description
   - Root cause analysis
   - Solution implemented
   - Testing results
   - Files modified
4. **Update tickets** when issues are resolved
5. **Use commit hashes** in ticket descriptions

## 💬 **Communication Patterns & Shorthand**

### **Quick Responses**
- "LOLMAO" = User finds something funny/ironic
- "READY?" = User is about to describe a new bug
- "its fixed" = Issue resolved, ready for next
- "thanks" = Acknowledgment, continue
- "undo" = Revert last change

### **Bug Reporting Pattern**
- User describes issue
- I investigate and propose solution
- User confirms or asks questions
- I implement fix
- User tests and confirms
- I document and commit

### **Testing Workflow**
1. **Build test**: `npm run build` to check for errors
2. **Functionality test**: User tests the actual feature
3. **Persistence test**: Refresh page to verify state persistence
4. **Documentation**: Update Linear tickets and commit messages

## 📊 **Data & Visualization**

### **Quantity Scaling**
- **Purpose**: Prevent lines from "shooting off into cosmos"
- **Algorithm**: Proportional scaling with min/max bounds
- **Parameters**: `maxAllowedLength: 2.5`, `minLength: 0.2`
- **Files**: `quantityScaling.ts`, `QuantityLine.tsx`, `QuantityMarkers.tsx`

### **Column Mapping System**
- **Dynamic mapping**: Map any column to visualization parameters
- **Persistence**: localStorage saves mapping across sessions
- **Quantity mapping**: Updates `location.quantity` field dynamically
- **Files**: `LocationContext.tsx`, `DataTable.tsx`, `ColumnSelector.tsx`

### **Data Structure**
```typescript
interface Location {
  id: string
  name?: string
  latitude?: number
  longitude?: number
  quantity?: number
  created_at: string
  updated_at: string
  [key: string]: any  // Dynamic columns
}
```

## 🎨 **UI Components**

### **Drawer Component**
- **Purpose**: Main editing interface
- **Features**: Location editing, coordinate display, action buttons
- **Layout**: Vertical button stack for more record space
- **Font**: Consistent with content (no special heading font)

### **Quantity Visualization**
- **Lines**: Scaled quantity lines extending from globe
- **Labels**: Combined format "Country (Value)"
- **Scaling**: Proportional to prevent extreme lengths
- **Conditional**: Hide location labels when quantity viz is active

## 🔄 **Workflow Patterns**

### **Bug Fix Cycle**
1. **User reports bug** → I create Linear ticket
2. **Investigation** → I analyze and propose solution
3. **Implementation** → I code the fix
4. **Testing** → User tests, I verify build
5. **Documentation** → I update ticket and commit
6. **Next bug** → User reports what the fix revealed

### **Commit Message Format**
```
feat: implement dynamic quantity mapping system

- Add dynamic quantity field updates when mapping columns to 'Quantity'
- Update LocationContext to sync mapped columns to location.quantity
- Add clear mapping handling to reset quantity field
- Include comprehensive debugging logs for troubleshooting
- Fix issue where quantity visualization showed years instead of GDP values
- Add documentation in DYNAMIC_QUANTITY_MAPPING.md

Technical Changes:
- Modified setColumnMapping to update location.quantity when parameter='quantity'
- Added clearColumnMapping logic to reset quantity field
- Added debug logging for mapping process
- Updated quantity field with numeric values from mapped columns

Testing:
- Verified column mapping triggers quantity field updates
- Confirmed GDP values replace year values in visualization
- Added console logging for debugging mapping process

Fixes: Dynamic quantity mapping mismatch between column mapping and visualization
```

## 📝 **Documentation Files**
- `DYNAMIC_QUANTITY_MAPPING.md` - Quantity mapping system
- `QUANTITY_SCALING.md` - Scaling algorithms
- `PROJECT_CONTEXT.md` - This file

## 🚨 **Known Issues**
- Source map warnings (non-critical)
- ESLint warnings for unused variables (non-critical)
- MediaPipe source map missing (non-critical)

## 🎯 **Current Status**
- ✅ Double scaling issue fixed (MOT-217)
- ✅ Column mapping persistence fixed (MOT-218)
- ✅ Dynamic quantity mapping implemented
- ✅ Quantity scaling working properly
- ✅ Drawer layout optimized

## 🔮 **Next Steps**
- Monitor for new bugs revealed by fixes
- Continue systematic bug resolution
- Maintain documentation as system evolves
- Track time spent on different task types

---

**This document should be shared with new chat instances to provide immediate context and accelerate onboarding.**
