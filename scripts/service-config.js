/**
 * Service configuration for deployment
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceConfig = {
  vercel: {
    token: process.env.VERCEL_TOKEN,
    projectId: process.env.VERCEL_PROJECT_ID,
    orgId: process.env.VERCEL_ORG_ID
  }
};

function validateServiceConfig(service) {
  const config = serviceConfig[service];
  if (!config) {
    throw new Error(`Service ${service} not configured`);
  }
  
  if (service === 'vercel') {
    if (!config.token) {
      throw new Error('VERCEL_TOKEN not found in .env');
    }
    if (!config.projectId) {
      throw new Error('VERCEL_PROJECT_ID not found in .env');
    }
  }
  
  return config;
}

function getVercelDeployCommand() {
  const config = serviceConfig.vercel;
  return `vercel --prod --token ${config.token} --yes`;
}

module.exports = {
  serviceConfig,
  validateServiceConfig,
  getVercelDeployCommand
};