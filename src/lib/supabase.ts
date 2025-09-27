import { createClient, SupabaseClient } from '@supabase/supabase-js'

// For local development, use mock values or disable Supabase
const isDevelopment = process.env.NODE_ENV === 'development'

// Mock Supabase client for development
const mockSupabase: SupabaseClient = {
  from: () => ({
    select: () => ({ order: () => ({ data: [], error: null }) }),
    insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    delete: () => ({ eq: () => ({ error: null }) })
  })
} as any

// Only create real Supabase client if we have valid credentials
let supabase: SupabaseClient
if (isDevelopment) {
  supabase = mockSupabase
} else {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url'
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key'
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Database types
export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
}

// Local storage fallback for development
const STORAGE_KEY = 'globe-locations'

const getStoredLocations = (): Location[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const storeLocations = (locations: Location[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations))
  } catch (error) {
    console.error('Error storing locations:', error)
  }
}

// Database functions
export const locationService = {
  // Get all locations
  async getLocations(): Promise<Location[]> {
    // In development mode, use localStorage
    if (isDevelopment) {
      return getStoredLocations()
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching locations:', error)
        return getStoredLocations() // Fallback to localStorage
      }
      
      return data || []
    } catch (error) {
      console.error('Database connection error:', error)
      return getStoredLocations() // Fallback to localStorage
    }
  },

  // Add a new location
  async addLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location | null> {
    const newLocation: Location = {
      id: Date.now().toString(),
      ...location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // In development mode, use localStorage
    if (isDevelopment) {
      const locations = getStoredLocations()
      locations.unshift(newLocation)
      storeLocations(locations)
      return newLocation
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([location])
        .select()
        .single()
      
      if (error) {
        console.error('Error adding location:', error)
        // Fallback to localStorage
        const locations = getStoredLocations()
        locations.unshift(newLocation)
        storeLocations(locations)
        return newLocation
      }
      
      return data
    } catch (error) {
      console.error('Database connection error:', error)
      // Fallback to localStorage
      const locations = getStoredLocations()
      locations.unshift(newLocation)
      storeLocations(locations)
      return newLocation
    }
  },

  // Update a location
  async updateLocation(id: string, updates: Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>>): Promise<Location | null> {
    // In development mode, use localStorage
    if (isDevelopment) {
      const locations = getStoredLocations()
      const locationIndex = locations.findIndex(loc => loc.id === id)
      if (locationIndex === -1) return null
      
      const updatedLocation = {
        ...locations[locationIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      locations[locationIndex] = updatedLocation
      storeLocations(locations)
      return updatedLocation
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating location:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  },

  // Delete a location
  async deleteLocation(id: string): Promise<boolean> {
    // In development mode, use localStorage
    if (isDevelopment) {
      const locations = getStoredLocations()
      const filtered = locations.filter(loc => loc.id !== id)
      storeLocations(filtered)
      return true
    }

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting location:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Database connection error:', error)
      return false
    }
  }
}
