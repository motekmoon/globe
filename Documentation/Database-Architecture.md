# Database Architecture Documentation

## Overview
The Globe application implements a hybrid storage architecture that provides offline-first functionality with multiple fallback layers for data persistence.

## Storage Hierarchy

### 1. IndexedDB (Primary - Development)
- **Purpose**: Machine-level storage that survives browser cache clearing
- **Database Name**: `GlobeLocationsDB`
- **Store Name**: `locations`
- **Capacity**: ~50MB+ (much larger than localStorage)
- **Persistence**: ✅ Survives cache clearing
- **Offline**: ✅ Works completely offline

### 2. localStorage (Fallback - Development)
- **Purpose**: Browser storage fallback when IndexedDB fails
- **Key**: `globe-locations`
- **Capacity**: ~5-10MB
- **Persistence**: ❌ Lost when cache is cleared
- **Offline**: ✅ Works offline

### 3. Supabase (Production)
- **Purpose**: Cloud database for production deployment
- **Type**: PostgreSQL database
- **Persistence**: ✅ Permanent cloud storage
- **Offline**: ❌ Requires internet connection

## Data Structure

```typescript
interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
}
```

## Implementation Details

### IndexedDB Storage Class
- **File**: `src/lib/indexeddb.ts`
- **Class**: `IndexedDBStorage`
- **Methods**:
  - `init()`: Initialize database connection
  - `getLocations()`: Retrieve all locations
  - `addLocation()`: Add new location
  - `updateLocation()`: Update existing location
  - `deleteLocation()`: Remove location
  - `exportLocations()`: Export to JSON
  - `importLocations()`: Import from JSON

### Service Layer
- **File**: `src/lib/supabase.ts`
- **Class**: `locationService`
- **Fallback Logic**:
  1. Try IndexedDB (development)
  2. Fall back to localStorage if IndexedDB fails
  3. Use Supabase in production mode

## Environment Configuration

### Development Mode
```env
NODE_ENV=development
REACT_APP_ENV=development
REACT_APP_SUPABASE_URL=https://mock.supabase.co
REACT_APP_SUPABASE_ANON_KEY=mock-anon-key
```

### Production Mode
```env
NODE_ENV=production
REACT_APP_SUPABASE_URL=your-real-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-real-supabase-key
```

## Benefits

### Offline-First Architecture
- ✅ Works completely offline
- ✅ Data stored on user's machine
- ✅ No internet required for basic functionality
- ✅ Survives browser cache clearing

### Robust Fallbacks
- ✅ IndexedDB fails → Falls back to localStorage
- ✅ localStorage fails → Still works with in-memory data
- ✅ Production mode → Uses Supabase cloud database

### Data Portability
- ✅ Export all locations to JSON file
- ✅ Import locations from JSON backup
- ✅ Easy data migration and backup

## Future Improvements

### Planned Enhancements
1. **Data Synchronization**: Sync IndexedDB with Supabase when online
2. **Conflict Resolution**: Handle data conflicts between local and cloud
3. **Backup Automation**: Automatic cloud backup of local data
4. **Data Compression**: Optimize storage for large datasets
5. **Encryption**: Add client-side encryption for sensitive data

### Performance Optimizations
1. **Lazy Loading**: Load locations on demand
2. **Pagination**: Handle large location datasets
3. **Caching**: Implement smart caching strategies
4. **Indexing**: Add database indexes for faster queries

## Migration Path

### Development → Production
1. Set up real Supabase project
2. Update environment variables
3. Run database migrations
4. Deploy with production configuration

### Data Migration
1. Export locations from IndexedDB
2. Import to Supabase database
3. Verify data integrity
4. Switch to production mode

## Security Considerations

### Data Protection
- Client-side data encryption (future)
- Secure API endpoints
- Input validation and sanitization
- SQL injection prevention

### Privacy
- No data collection without consent
- Local-first data storage
- User control over data export/import
- GDPR compliance considerations

## Monitoring and Maintenance

### Health Checks
- Database connection status
- Storage quota monitoring
- Performance metrics
- Error logging and alerting

### Backup Strategy
- Regular IndexedDB exports
- Cloud backup synchronization
- Data integrity verification
- Disaster recovery procedures
