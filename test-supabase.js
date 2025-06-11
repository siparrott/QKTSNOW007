// Quick Supabase connection test
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Key:', supabaseKey ? 'Set' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test basic connection
async function testConnection() {
  try {
    // Test 1: Simple health check
    const { data, error } = await supabase.from('test').select('*').limit(1);
    console.log('Database query test:', error ? `Error: ${error.message}` : 'Success');
    
    // Test 2: Auth signup with unique email
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456'
    });
    
    console.log('Auth signup test:', authError ? `Error: ${authError.message}` : 'Success');
    
    if (authData.user) {
      console.log('User created:', authData.user.id);
      console.log('Email confirmation required:', !authData.session);
    }
    
  } catch (error) {
    console.error('Connection test failed:', error.message);
  }
}

testConnection();