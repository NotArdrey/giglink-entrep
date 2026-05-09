// Diagnostic test for Supabase connection
// Run this in browser console (F12) after app loads, or check Network tab

const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Connection...\n');
  
  const url = 'https://dczhfpcfqlygpbqjctwf.supabase.co';
  const key = 'sb_publishable_YFgfiGPizdbN-jtd9suIJw__NVqsltC';
  
  console.log('📋 Credentials:');
  console.log('   URL:', url);
  console.log('   Key:', key.slice(0, 20) + '...');
  
  try {
    // Test 1: Direct fetch to Supabase REST API
    console.log('\n📡 Test 1: Direct REST API call...');
    const response = await fetch(
      `${url}/rest/v1/profiles?limit=1`,
      {
        headers: {
          'apikey': key,
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS: Supabase API is reachable');
      console.log('   Response:', data);
    } else {
      const error = await response.text();
      console.log('   ❌ ERROR:', error);
    }
    
  } catch (error) {
    console.error('   ❌ NETWORK ERROR:', error.message);
    console.log('\n⚠️  Possible causes:');
    console.log('   1. Supabase project is suspended or offline');
    console.log('   2. Network connectivity issue (VPN/Firewall)');
    console.log('   3. CORS blocked (check browser network tab)');
    console.log('   4. DNS resolution failed');
    console.log('   5. API key is invalid or revoked');
  }
};

// Also check environment variables
console.log('🔧 Environment Check:');
console.log('   REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('   REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

// Run the test
testSupabaseConnection();

// Export for manual testing
window.testSupabaseConnection = testSupabaseConnection;
console.log('\n💡 Tip: Run testSupabaseConnection() again at any time in console');
