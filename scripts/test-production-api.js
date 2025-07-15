#!/usr/bin/env node

const axios = require('axios');

async function testProductionAPI() {
  console.log('🔍 Testing production API at media.synthetikmedia.ai...\n');
  
  try {
    const response = await axios.get('https://media.synthetikmedia.ai/api/videos/list?limit=10');
    
    console.log('✅ API Response received');
    console.log('Status:', response.status);
    console.log('\nData:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n⚠️  This usually means the environment variables are not set in Vercel');
      console.log('\nTo fix this:');
      console.log('1. Go to https://vercel.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to Settings > Environment Variables');
      console.log('4. Add these variables:');
      console.log('   - bunny_cdn_streaming_library');
      console.log('   - bunny_cdn_streaming_key');
      console.log('   - bunny_cdn_streaming_hostname');
    }
  }
}

testProductionAPI();