# Globe Data Purge Script

This document provides instructions for deleting all data from the Globe application database using command line tools.

## Overview

The Globe app stores data in two places:
- **localStorage**: Browser storage for 'globe-locations' and other data
- **IndexedDB**: Database named 'GlobeLocationsDB' containing location data

## Script Creation

Create the purge script:

```bash
cd "/Users/zinchiang/DJ HEL1X Website/interactive-globe"
cat > clear-globe-data.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Clear Globe Data</title></head>
<body>
<script>
console.log('🗑️ Starting Globe data purge...');

// Clear localStorage
localStorage.removeItem('globe-locations');
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear IndexedDB
const request = indexedDB.open('GlobeLocationsDB', 1);
request.onsuccess = () => {
  const db = request.result;
  const transaction = db.transaction(['locations'], 'readwrite');
  const store = transaction.objectStore('locations');
  store.clear();
  console.log('✅ IndexedDB cleared');
  db.close();
  console.log('🎯 All Globe data deleted successfully!');
};
request.onerror = () => {
  console.log('ℹ️ IndexedDB not found or already cleared');
  console.log('🎯 Globe data deletion completed!');
};
</script>
</body>
</html>
EOF
```

## Usage Methods

### Method 1: Open in Default Browser
```bash
cd "/Users/zinchiang/DJ HEL1X Website/interactive-globe"
open clear-globe-data.html
```

### Method 2: Open in Specific Browser
```bash
# Chrome
open -a "Google Chrome" "/Users/zinchiang/DJ HEL1X Website/interactive-globe/clear-globe-data.html"

# Safari
open -a Safari "/Users/zinchiang/DJ HEL1X Website/interactive-globe/clear-globe-data.html"

# Firefox
open -a Firefox "/Users/zinchiang/DJ HEL1X Website/interactive-globe/clear-globe-data.html"
```

### Method 3: Run with Node.js
```bash
cd "/Users/zinchiang/DJ HEL1X Website/interactive-globe"
node -e "
const { exec } = require('child_process');
exec('open clear-globe-data.html', (error, stdout, stderr) => {
  if (error) console.error('Error:', error);
  else console.log('Data clearing script opened');
});
"
```

## What Gets Deleted

The script will permanently delete:
- All location markers
- All imported datasets
- All custom data stored in localStorage
- All data in the IndexedDB 'GlobeLocationsDB' database

## Cleanup

After running the script, remove it:

```bash
rm "/Users/zinchiang/DJ HEL1X Website/interactive-globe/clear-globe-data.html"
```

## Verification

To verify the data has been cleared:
1. Open the Globe application
2. Check that no location markers are visible
3. Open browser developer tools (F12)
4. Check Application tab → Storage → localStorage (should be empty)
5. Check Application tab → Storage → IndexedDB (should show empty database)

## Important Notes

- ⚠️ **This action cannot be undone**
- The script must be run in a browser environment
- Make sure to backup any important data before running
- The script will show console messages confirming deletion progress
