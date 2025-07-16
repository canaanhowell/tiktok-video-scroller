// Unified Service Configuration Manager
// This file contains the correct, tested methods for connecting to all services

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envResult = dotenv.config({ path: envPath });

if (envResult.error && process.env.NODE_ENV !== 'production') {
  console.warn('Warning: .env.local file not found, using environment variables');
}

// Service Configuration with tested connection methods
const serviceConfig = {
  // Vercel - Correct token name is "Vercel_token" with lowercase 't'
  vercel: {
    token: process.env.Vercel_token,
    projectId: process.env.VERCEL_PROJECT_ID,
    deployCommand: (token) => `vercel --prod --token ${token} --yes`,
    testCommand: (token) => `vercel whoami --token ${token}`,
    envVarName: 'Vercel_token' // Document the correct env var name
  },

  // Bunny CDN - Working configuration (matching actual env var names)
  bunnyCdn: {
    apiKey: process.env.bunny_cdn_admin_key,
    storageApiKey: process.env.bunny_cdn_storage_key,
    streamApiKey: process.env.bunny_cdn_streaming_key,
    streamLibraryId: process.env.bunny_cdn_streaming_library?.trim(),
    streamCdnHostname: process.env.bunny_cdn_streaming_hostname,
    storageZone: process.env.bunny_cdn_storage_zone,
    baseUrl: 'https://api.bunny.net',
    videoBaseUrl: 'https://video.bunnycdn.com',
    testEndpoint: '/videolibrary',
    headers: (apiKey) => ({
      'AccessKey': apiKey,
      'Content-Type': 'application/json'
    })
  },

  // Supabase - Working configuration (matching actual env var names)
  supabase: {
    url: process.env.Supabase_project_url?.trim(),
    anonKey: process.env.supabase_project_api?.trim(),
    serviceRoleKey: process.env.supabase_admin_token?.trim(),
    testEndpoint: '/rest/v1/',
    headers: (apiKey) => ({
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },

  // Upstash Redis - Working configuration (matching actual env var names)
  upstash: {
    restUrl: process.env.Redis_HTTPS_Endpoint?.trim(),
    restToken: process.env.Upstash_Redis__Token?.trim(),
    apiKey: process.env.upstash_api_key,
    testCommand: 'PING',
    headers: (token) => ({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
  },

  // GitHub - Working configuration
  github: {
    token: process.env.GITHUB_TOKEN,
    testCommand: 'gh auth status',
    apiBaseUrl: 'https://api.github.com'
  }
};

// Helper function to validate service configuration
function validateServiceConfig(serviceName) {
  const config = serviceConfig[serviceName];
  if (!config) {
    throw new Error(`Service '${serviceName}' not found in configuration`);
  }

  const missingVars = [];
  
  // Check required environment variables for each service
  switch (serviceName) {
    case 'vercel':
      if (!config.token) missingVars.push('Vercel_token');
      if (!config.projectId) missingVars.push('VERCEL_PROJECT_ID');
      break;
    
    case 'bunnyCdn':
      if (!config.streamApiKey) missingVars.push('bunny_cdn_streaming_key');
      if (!config.streamLibraryId) missingVars.push('bunny_cdn_streaming_library');
      break;
    
    case 'supabase':
      if (!config.url) missingVars.push('Supabase_project_url');
      if (!config.anonKey) missingVars.push('supabase_project_api');
      break;
    
    case 'upstash':
      if (!config.restUrl) missingVars.push('Redis_HTTPS_Endpoint');
      if (!config.restToken) missingVars.push('Upstash_Redis__Token');
      break;
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables for ${serviceName}: ${missingVars.join(', ')}`);
  }

  return config;
}

// Export for use in other scripts
module.exports = {
  serviceConfig,
  validateServiceConfig,
  
  // Convenience methods for common operations
  getVercelDeployCommand: () => {
    const config = validateServiceConfig('vercel');
    return config.deployCommand(config.token);
  },
  
  getBunnyHeaders: () => {
    const config = validateServiceConfig('bunnyCdn');
    return config.headers(config.streamApiKey);
  },
  
  getSupabaseHeaders: () => {
    const config = validateServiceConfig('supabase');
    return config.headers(config.serviceRoleKey || config.anonKey);
  },
  
  getUpstashHeaders: () => {
    const config = validateServiceConfig('upstash');
    return config.headers(config.restToken);
  }
};