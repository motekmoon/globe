# Quantity Line Visualization Scaling

## Overview

This document describes the implementation of proportional scaling for quantity line visualizations to prevent lines from extending too far into space ("shooting off into the cosmos").

## Problem

When quantity values are very high, the visualization lines extend far beyond the globe, making the visualization unusable and cluttered. The lines would "shoot off into the cosmos" without proper scaling.

## Solution

Implemented an arithmetic scaling function that:

1. **Detects high quantity values** that would cause lines to extend too far
2. **Applies proportional scaling** to reduce all quantity values by a percentage
3. **Ensures the highest value** stays within reasonable visualization bounds
4. **Maintains relative proportions** between different quantity values

## Technical Implementation

### Files Modified

- `src/utils/quantityScaling.ts` - New utility for scaling calculations
- `src/components/visualization/QuantityLine.tsx` - Updated to accept scaled values
- `src/components/visualization/QuantityMarkers.tsx` - Updated to calculate and apply scaling

### Scaling Algorithm

```typescript
// Key parameters
const maxAllowedLength = 1.5;  // Maximum line length in 3D units
const minLength = 0.1;        // Minimum line length
const threshold = 0.8;        // Scaling threshold (80% of max allowed)

// Scaling logic
if (directMaxLength <= maxAllowedLength * 0.8) {
  // No scaling needed - values are within reasonable bounds
  return originalValues;
} else {
  // Apply proportional scaling
  const scaleFactor = (maxAllowedLength * 20) / maxOriginalValue;
  return quantities.map(q => (q * scaleFactor) / 20);
}
```

### Visual Behavior

- **Globe Surface (Value 0)**: The dot marker on the globe surface
- **Quantity Line**: Extends outward from the dot based on scaled quantity value
- **Label**: Shows the original quantity value at the end of the line

## Testing Results

### Test 1: Normal Values (5, 10, 15, 20)
- **Result**: No scaling applied (0.25, 0.5, 0.75, 1.0)
- **Status**: ✅ Working correctly

### Test 2: High Values (100, 200, 500, 1000)
- **Result**: Scaled down by 97% (0.15, 0.3, 0.75, 1.5)
- **Status**: ✅ Prevents lines from shooting off

### Test 3: Extreme Values (1000, 5000, 10000, 50000)
- **Result**: Scaled down by 100% (0.1, 0.15, 0.3, 1.5)
- **Status**: ✅ Keeps all lines within bounds

## Usage

The scaling is applied automatically when rendering quantity markers:

```typescript
// In QuantityMarkers.tsx
const { scaledQuantities } = useMemo(() => {
  const quantities = visibleLocations.map(location => location.quantity || 0);
  const scalingResult = scaleQuantities(quantities);
  // ... create scaled map
}, [locations, hiddenLocations]);

// Pass scaled quantity to QuantityLine
<QuantityLine
  quantity={location.quantity}        // Original value for display
  scaledQuantity={scaledQuantity}    // Scaled value for line length
  // ... other props
/>
```

## Benefits

1. **Prevents cosmic lines**: No more lines shooting off into space
2. **Maintains proportions**: Relative differences between quantities preserved
3. **Automatic scaling**: No manual intervention required
4. **Readable visualization**: All lines stay within reasonable bounds
5. **Performance**: Efficient scaling calculation using useMemo

## Configuration

The scaling behavior can be adjusted by modifying parameters in `quantityScaling.ts`:

- `maxAllowedLength`: Maximum line length (default: 1.5)
- `minLength`: Minimum line length (default: 0.1)
- `threshold`: Scaling threshold percentage (default: 0.8)

## Linear Ticket

- **Ticket**: MOT-216 "Fix Quantity Line Visualization Scaling - Lines Shooting Off Into Cosmos"
- **Status**: ✅ COMPLETED
- **URL**: https://linear.app/motekmoon/issue/MOT-216/fix-quantity-line-visualization-scaling-lines-shooting-off-into-cosmos
