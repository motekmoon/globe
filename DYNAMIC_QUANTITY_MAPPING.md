# Dynamic Quantity Mapping Implementation

## Problem

The quantity visualization system was showing **years** instead of **GDP per capita values** because of a mismatch between the dynamic column mapping system and the static quantity field.

## Root Cause Analysis

### The Issue
1. **DataTable** had dynamic column mapping (e.g., `gdp_per_capita` → "Quantity")
2. **QuantityLine** was reading from static `location.quantity` field
3. **Column mapping** was display-only and didn't update the core quantity field
4. **Result**: Visualization showed years instead of GDP values

### The Data Flow Problem
```
DataTable Column Mapping → Display Only
     ↓
location.quantity (static field) ← QuantityLine reads from here
     ↓
Shows wrong values (years instead of GDP)
```

## Solution

### Dynamic Quantity Field Updates
Updated `LocationContext.tsx` to automatically sync mapped columns to `location.quantity`:

```typescript
const setColumnMapping = useCallback(
  (columnName: string, parameter: string) => {
    // Update column mapping state
    setColumnMappingState((prev) => ({
      ...prev,
      [columnName]: parameter,
    }));

    // If mapping to quantity, update location.quantity field
    if (parameter === "quantity") {
      setLocations((prevLocations) =>
        prevLocations.map((location) => {
          const mappedValue = (location as any)[columnName];
          if (mappedValue !== undefined && mappedValue !== null) {
            const numericValue = parseFloat(mappedValue);
            if (!isNaN(numericValue)) {
              return {
                ...location,
                quantity: numericValue,
              };
            }
          }
          return location;
        })
      );
    }
  },
  []
);
```

### Clear Mapping Handling
Added logic to reset quantity field when column mapping is cleared:

```typescript
const clearColumnMapping = useCallback(
  (columnName: string) => {
    // Clear column mapping
    setColumnMappingState((prev) => {
      const newMapping = { ...prev };
      delete newMapping[columnName];
      return newMapping;
    });

    // If clearing a quantity mapping, reset quantity field
    const currentMapping = columnMapping[columnName];
    if (currentMapping === "quantity") {
      setLocations((prevLocations) =>
        prevLocations.map((location) => ({
          ...location,
          quantity: undefined,
        }))
      );
    }
  },
  [columnMapping]
);
```

## Technical Implementation

### Files Modified
- `src/contexts/LocationContext.tsx` - Added dynamic quantity field updates
- Added comprehensive debugging logs for troubleshooting

### Key Features
1. **Automatic Sync**: When you map a column to "Quantity", it updates `location.quantity`
2. **Data Validation**: Only numeric values are mapped to quantity field
3. **Clear Handling**: Clearing a quantity mapping resets the quantity field
4. **Debug Logging**: Console logs help track the mapping process

### Data Flow (Fixed)
```
DataTable Column Mapping → Updates location.quantity
     ↓
location.quantity (dynamic field) ← QuantityLine reads from here
     ↓
Shows correct values (GDP instead of years)
```

## Usage

### How to Use Dynamic Quantity Mapping
1. **Open DataTable** in the application
2. **Find the column** you want to use for quantity (e.g., `gdp_per_capita`)
3. **Select "Quantity"** from the dropdown
4. **System automatically updates** all `location.quantity` fields
5. **Quantity visualization** now shows the mapped values

### Debugging
The system includes comprehensive logging:
- `🔧 setColumnMapping called: [column] → [parameter]`
- `🔄 Mapping column '[column]' to quantity field`
- `📊 Sample location data: [object]`
- `🔍 Processing [location]: [column] = [value]`
- `📊 Updated [location]: [value] → quantity: [numeric]`

## Testing Results

### Before Fix
- **DataTable**: Shows `gdp_per_capita` mapped to "Quantity"
- **QuantityLine**: Shows "Japan (1982)" - wrong values
- **Issue**: Column mapping was display-only

### After Fix
- **DataTable**: Shows `gdp_per_capita` mapped to "Quantity"
- **QuantityLine**: Shows "Japan (45000)" - correct GDP values
- **Result**: Dynamic mapping works correctly

## Important Notes

### Quantity Visualization Toggle
The quantity visualization is controlled by `showQuantityVisualization` state in `App.tsx`:
```typescript
const [showQuantityVisualization, setShowQuantityVisualization] = React.useState(false);
```

**The quantity visualization is OFF by default!** You need to enable it to see the quantity lines.

### System Integration
The `location.quantity` field is used throughout the system:
- **QuantityLine visualization** - Line length and labels
- **Drawer display** - Shows quantity values
- **DataTable filtering** - Filter "With Quantity" vs "Without Quantity"
- **CSV export** - Includes quantity in exported data
- **Form editing** - Edit quantity values

## Future Improvements

1. **UI Toggle**: Add a visible toggle for quantity visualization
2. **Multiple Mappings**: Support multiple quantity columns
3. **Real-time Updates**: Update visualization without page refresh
4. **Validation**: Better error handling for invalid mappings

## Commit Information

- **Files Changed**: 1 file modified
- **Lines Added**: ~40 lines of dynamic mapping logic
- **Lines Removed**: 0
- **Functionality**: Dynamic quantity field updates
- **Testing**: Manual testing with GDP per capita data
- **Status**: ✅ COMPLETED

---

**Next Bug**: Ready to discover the next issue! 🐛
