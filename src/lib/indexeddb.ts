// IndexedDB storage for offline-first location management
const DB_NAME = 'GlobeLocationsDB'
const DB_VERSION = 1
const STORE_NAME = 'locations'

export interface Location {
  id: string
  name?: string
  latitude?: number
  longitude?: number
  quantity?: number
  created_at: string
  updated_at: string
  // Allow additional dynamic columns
  [key: string]: any
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('created_at', 'created_at', { unique: false })
        }
      }
    })
  }

  async getLocations(): Promise<Location[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const locations = request.result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        console.log('🗄️ IndexedDB: Retrieved', locations.length, 'locations from database')
        if (locations.length > 0) {
          console.log('🗄️ IndexedDB: Sample location:', locations[0])
        }
        resolve(locations)
      }
      request.onerror = () => {
        console.error('❌ IndexedDB: Error retrieving locations:', request.error)
        reject(request.error)
      }
    })
  }

  async addLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location> {
    if (!this.db) await this.init()

    const newLocation: Location = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(newLocation)

      request.onsuccess = () => {
        console.log('💾 IndexedDB: Successfully saved location:', newLocation.name, 'with ID:', newLocation.id)
        resolve(newLocation)
      }
      request.onerror = () => {
        console.error('❌ IndexedDB: Error saving location:', request.error)
        reject(request.error)
      }
    })
  }

  async updateLocation(id: string, updates: Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>>): Promise<Location | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const existingLocation = getRequest.result
        if (!existingLocation) {
          resolve(null)
          return
        }

        const updatedLocation = {
          ...existingLocation,
          ...updates,
          updated_at: new Date().toISOString()
        }

        const putRequest = store.put(updatedLocation)
        putRequest.onsuccess = () => resolve(updatedLocation)
        putRequest.onerror = () => reject(putRequest.error)
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async deleteLocation(id: string): Promise<boolean> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  async exportLocations(): Promise<string> {
    const locations = await this.getLocations()
    return JSON.stringify(locations, null, 2)
  }

  async importLocations(jsonData: string): Promise<boolean> {
    try {
      const locations = JSON.parse(jsonData)
      if (!Array.isArray(locations)) return false

      // Clear existing data
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      await new Promise((resolve, reject) => {
        const clearRequest = store.clear()
        clearRequest.onsuccess = () => resolve(true)
        clearRequest.onerror = () => reject(clearRequest.error)
      })

      // Add imported locations
      for (const location of locations) {
        await this.addLocation(location)
      }

      return true
    } catch (error) {
      console.error('Import error:', error)
      return false
    }
  }

  async clearAllData(): Promise<boolean> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => {
        console.log('✅ IndexedDB data cleared successfully')
        resolve(true)
      }
      clearRequest.onerror = () => {
        console.error('❌ Error clearing IndexedDB data:', clearRequest.error)
        reject(clearRequest.error)
      }
    })
  }
}

export const indexedDBStorage = new IndexedDBStorage()
