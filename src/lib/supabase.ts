import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { indexedDBStorage } from './indexeddb'

// Check if we have real Supabase credentials
const hasSupabaseCredentials = process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY
const isDevelopment = !hasSupabaseCredentials

// Debug logging
console.log('🔧 Supabase Config Debug:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET')
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
console.log('hasSupabaseCredentials:', hasSupabaseCredentials)
console.log('isDevelopment:', isDevelopment)

// Mock Supabase client for development
const mockSupabase: SupabaseClient = {
  from: () => ({
    select: () => ({ order: () => ({ data: [], error: null }) }),
    insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    delete: () => ({ eq: () => ({ error: null }) })
  }),
  auth: {
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    signIn: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
} as any

// Only create real Supabase client if we have valid credentials
let supabase: SupabaseClient
if (isDevelopment) {
  supabase = mockSupabase
} else {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url'
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key'
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

export { supabase }

// Authentication types
export interface AuthUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthError {
  message: string
  status?: number
  code?: string
}

// Database types
export interface Location {
  id: string
  name?: string
  latitude?: number
  longitude?: number
  quantity?: number  // New field for dynamic visualization
  created_at: string
  updated_at: string
  user_id?: string  // Link to authenticated user
  // Allow additional dynamic columns
  [key: string]: any
}

// User metrics for analytics
export interface UserMetrics {
  id: string
  user_id: string
  session_id: string
  action: string
  timestamp: string
  metadata?: Record<string, any>
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
    // FORCE LOCAL STORAGE ONLY - Supabase operations commented out
    // In development mode, use IndexedDB with localStorage fallback
    if (isDevelopment) {
      try {
        await indexedDBStorage.init()
        return await indexedDBStorage.getLocations()
      } catch (error) {
        console.error('IndexedDB error, falling back to localStorage:', error)
        return getStoredLocations()
      }
    }

    // COMMENTED OUT: Supabase operations disabled to prevent import errors
    // try {
    //   const { data, error } = await supabase
    //     .from('locations')
    //     .select('*')
    //     .order('created_at', { ascending: false })
    //   
    //   if (error) {
    //     console.error('Error fetching locations:', error)
    //     return getStoredLocations() // Fallback to localStorage
    //   }
    //   
    //   return data || []
    // } catch (error) {
    //   console.error('Database connection error:', error)
    //   return getStoredLocations() // Fallback to localStorage
    // }

    // FORCE LOCAL STORAGE FALLBACK
    console.log('🔧 Using local storage only (Supabase disabled)')
    return getStoredLocations()
  },

  // Add a new location
  async addLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location | null> {
    // FORCE LOCAL STORAGE ONLY - Supabase operations commented out
    // In development mode, use IndexedDB with localStorage fallback
    if (isDevelopment) {
      try {
        await indexedDBStorage.init()
        return await indexedDBStorage.addLocation(location)
      } catch (error) {
        console.error('IndexedDB error, falling back to localStorage:', error)
        const newLocation: Location = {
          id: Date.now().toString(),
          ...location,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const locations = getStoredLocations()
        locations.unshift(newLocation)
        storeLocations(locations)
        return newLocation
      }
    }

    const newLocation: Location = {
      id: Date.now().toString(),
      ...location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // COMMENTED OUT: Supabase operations disabled to prevent import errors
    // try {
    //   const { data, error } = await supabase
    //     .from('locations')
    //     .insert([location])
    //     .select()
    //     .single()
    //   
    //   if (error) {
    //     console.error('Error adding location:', error)
    //     // Fallback to localStorage
    //     const locations = getStoredLocations()
    //     locations.unshift(newLocation)
    //     storeLocations(locations)
    //     return newLocation
    //   }
    //   
    //   return data
    // } catch (error) {
    //   console.error('Database connection error:', error)
    //   // Fallback to localStorage
    //   const locations = getStoredLocations()
    //   locations.unshift(newLocation)
    //   storeLocations(locations)
    //   return newLocation
    // }

    // FORCE LOCAL STORAGE FALLBACK
    console.log('🔧 Using local storage only (Supabase disabled)')
    const locations = getStoredLocations()
    locations.unshift(newLocation)
    storeLocations(locations)
    return newLocation
  },

  // Update a location
  async updateLocation(id: string, updates: Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>>): Promise<Location | null> {
    // FORCE LOCAL STORAGE ONLY - Supabase operations commented out
    // In development mode, use IndexedDB with localStorage fallback
    if (isDevelopment) {
      try {
        await indexedDBStorage.init()
        return await indexedDBStorage.updateLocation(id, updates)
      } catch (error) {
        console.error('IndexedDB error, falling back to localStorage:', error)
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
    }

    // COMMENTED OUT: Supabase operations disabled to prevent import errors
    // try {
    //   const { data, error } = await supabase
    //     .from('locations')
    //     .update(updates)
    //     .eq('id', id)
    //     .select()
    //     .single()

    //   if (error) {
    //     console.error('Error updating location:', error)
    //     return null
    //   }

    //   return data
    // } catch (error) {
    //   console.error('Database connection error:', error)
    //   return null
    // }

    // FORCE LOCAL STORAGE FALLBACK
    console.log('🔧 Using local storage only (Supabase disabled)')
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
  },

  // Delete a location
  async deleteLocation(id: string): Promise<boolean> {
    // FORCE LOCAL STORAGE ONLY - Supabase operations commented out
    // In development mode, use IndexedDB with localStorage fallback
    if (isDevelopment) {
      try {
        await indexedDBStorage.init()
        return await indexedDBStorage.deleteLocation(id)
      } catch (error) {
        console.error('IndexedDB error, falling back to localStorage:', error)
        const locations = getStoredLocations()
        const filtered = locations.filter(loc => loc.id !== id)
        storeLocations(filtered)
        return true
      }
    }

    // COMMENTED OUT: Supabase operations disabled to prevent import errors
    // try {
    //   const { error } = await supabase
    //     .from('locations')
    //     .delete()
    //     .eq('id', id)

    //   if (error) {
    //     console.error('Error deleting location:', error)
    //     return false
    //   }

    //   return true
    // } catch (error) {
    //   console.error('Database connection error:', error)
    //   return false
    // }

    // FORCE LOCAL STORAGE FALLBACK
    console.log('🔧 Using local storage only (Supabase disabled)')
    const locations = getStoredLocations()
    const filtered = locations.filter(loc => loc.id !== id)
    storeLocations(filtered)
    return true
  },

  // Export locations to JSON
  async exportLocations(): Promise<string> {
    // FORCE LOCAL STORAGE ONLY - Supabase operations commented out
    if (isDevelopment) {
      try {
        await indexedDBStorage.init()
        return await indexedDBStorage.exportLocations()
      } catch (error) {
        console.error('IndexedDB export error, using localStorage:', error)
        const locations = getStoredLocations()
        return JSON.stringify(locations, null, 2)
      }
    }
    
    // FORCE LOCAL STORAGE FALLBACK (Supabase disabled)
    console.log('🔧 Using local storage only (Supabase disabled)')
    const locations = getStoredLocations()
    return JSON.stringify(locations, null, 2)
  },

  // Import locations from JSON
  async importLocations(jsonData: string): Promise<boolean> {
    try {
      const locations = JSON.parse(jsonData)
      if (!Array.isArray(locations)) return false

      // FORCE LOCAL STORAGE ONLY - Supabase operations commented out
      if (isDevelopment) {
        try {
          await indexedDBStorage.init()
          return await indexedDBStorage.importLocations(jsonData)
        } catch (error) {
          console.error('IndexedDB import error, using localStorage:', error)
          storeLocations(locations)
          return true
        }
      }

      // FORCE LOCAL STORAGE FALLBACK (Supabase disabled)
      console.log('🔧 Using local storage only (Supabase disabled)')
      storeLocations(locations)
      return true
    } catch (error) {
      console.error('Import error:', error)
      return false
    }
  },

  // Purge all data - DEVELOPMENT ONLY
  async purgeAllData(): Promise<boolean> {
    console.warn('🗑️ PURGING ALL DATA - This action cannot be undone!')
    
    if (isDevelopment) {
      try {
        // Clear IndexedDB
        await indexedDBStorage.init()
        await indexedDBStorage.clearAllData()
        
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY)
        
        console.log('✅ All data purged successfully')
        return true
      } catch (error) {
        console.error('Error purging data:', error)
        return false
      }
    } else {
      console.error('❌ Data purging is only available in development mode')
      return false
    }
  }
}

// Authentication service
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, metadata?: { name?: string }): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    if (isDevelopment) {
      // Mock signup for development
      const mockUser: AuthUser = {
        id: Date.now().toString(),
        email,
        created_at: new Date().toISOString(),
        user_metadata: metadata
      }
      return { user: mockUser, error: null }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        return { user: null, error: { message: error.message, status: error.status, code: error.code } }
      }

      return { 
        user: data.user ? {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
          user_metadata: data.user.user_metadata
        } : null, 
        error: null 
      }
    } catch (error) {
      return { 
        user: null, 
        error: { message: error instanceof Error ? error.message : 'Signup failed', code: 'SIGNUP_ERROR' } 
      }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; session: AuthSession | null; error: AuthError | null }> {
    if (isDevelopment) {
      // Mock signin for development
      const mockUser: AuthUser = {
        id: Date.now().toString(),
        email,
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      }
      const mockSession: AuthSession = {
        user: mockUser,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000 // 1 hour
      }
      return { user: mockUser, session: mockSession, error: null }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, session: null, error: { message: error.message, status: error.status, code: error.code } }
      }

      const user = data.user ? {
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at,
        user_metadata: data.user.user_metadata
      } : null

      const session = data.session ? {
        user: user!,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at!
      } : null

      return { user, session, error: null }
    } catch (error) {
      return { 
        user: null, 
        session: null,
        error: { message: error instanceof Error ? error.message : 'Signin failed', code: 'SIGNIN_ERROR' } 
      }
    }
  },

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    if (isDevelopment) {
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      return { error: error ? { message: error.message, status: error.status, code: error.code } : null }
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Signout failed', code: 'SIGNOUT_ERROR' } }
    }
  },

  // Get current session
  async getSession(): Promise<{ session: AuthSession | null; error: AuthError | null }> {
    if (isDevelopment) {
      return { session: null, error: null }
    }

    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        return { session: null, error: { message: error.message, status: error.status, code: error.code } }
      }

      const session = data.session ? {
        user: {
          id: data.session.user.id,
          email: data.session.user.email!,
          created_at: data.session.user.created_at,
          last_sign_in_at: data.session.user.last_sign_in_at,
          user_metadata: data.session.user.user_metadata
        },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at!
      } : null

      return { session, error: null }
    } catch (error) {
      return { session: null, error: { message: error instanceof Error ? error.message : 'Get session failed', code: 'SESSION_ERROR' } }
    }
  },

  // Track user metrics
  async trackUserAction(userId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    // Temporarily disabled to isolate signup issue
    console.log('📊 User action tracked (disabled):', { userId, action, metadata })
    return
  },

  // Update user metadata (display name)
  async updateUserMetadata(updates: { name?: string }): Promise<{ success: boolean; error?: string }> {
    if (isDevelopment) {
      console.log('🔧 Mock: Updating user metadata:', updates);
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  },

  // Update user email
  async updateUserEmail(newEmail: string): Promise<{ success: boolean; error?: string }> {
    if (isDevelopment) {
      console.log('🔧 Mock: Updating email to:', newEmail);
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Email update failed' };
    }
  },

  // Update user password
  async updateUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (isDevelopment) {
      console.log('🔧 Mock: Updating password');
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Password update failed' };
    }
  },

  // Listen for auth state changes (including email confirmations)
  onAuthStateChange(callback: (event: any, session: any) => void) {
    if (isDevelopment) {
      console.log('🔧 Mock: Auth state change listener set up');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  }
}
