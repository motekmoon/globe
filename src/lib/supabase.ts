import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
}

// Database functions
export const locationService = {
  // Get all locations
  async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching locations:', error)
      return []
    }
    
    return data || []
  },

  // Add a new location
  async addLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .insert([location])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding location:', error)
      return null
    }
    
    return data
  },

  // Delete a location
  async deleteLocation(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting location:', error)
      return false
    }
    
    return true
  }
}
