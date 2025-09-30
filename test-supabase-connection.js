// Test Supabase connection and schema fix
const { createClient } = require('@supabase/supabase-js');

// Use the same credentials from .env.local
const supabaseUrl = 'https://okptgjyjfrpgdvrothuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcHRnanlqZnJwZ2R2cm90aHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjE0ODIsImV4cCI6MjA3NDgzNzQ4Mn0.BVGWqZh39riE1_sV9FLNeLb-Tl_1rlUXyzYK5CkJxso';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('locations').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // Test 2: Try to insert a test location (matching app data structure)
    console.log('2. Testing data insert with app data structure...');
    const testLocation = {
      name: 'Test Location from Script',
      latitude: 40.7128,
      longitude: -74.0060,
      quantity: 100.5
      // No id, created_at, updated_at - let Supabase handle these
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('locations')
      .insert([testLocation])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }
    
    console.log('✅ Insert successful!');
    console.log('📊 Inserted data:', insertData);
    
    // Test 3: Verify we can read the data back
    console.log('3. Testing data retrieval...');
    const { data: allData, error: readError } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (readError) {
      console.error('❌ Read failed:', readError);
      return;
    }
    
    console.log('✅ Read successful!');
    console.log('📊 Total locations:', allData.length);
    console.log('📊 Latest location:', allData[0]);
    
    console.log('🎉 All tests passed! Schema fix is working!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testConnection();
