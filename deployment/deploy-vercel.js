#!/usr/bin/env node

/**
 * Vercel deployment script using the correct service configuration
 */

const { serviceConfig, validateServiceConfig, getVercelDeployCommand } = require('./service-config');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function deployToVercel() {
  console.log(`${colors.blue}🚀 Starting Vercel Deployment${colors.reset}\n`);
  
  try {
    // Validate configuration
    const config = validateServiceConfig('vercel');
    
    console.log(`✓ Token configured: ${config.token.substring(0, 10)}...`);
    console.log(`✓ Project ID: ${config.projectId}`);
    console.log(`✓ Using command: vercel --prod --token [token] --yes\n`);
    
    // Execute deployment
    console.log(`${colors.yellow}📦 Building and deploying to production...${colors.reset}`);
    
    const deployCommand = getVercelDeployCommand();
    const { stdout, stderr } = await execPromise(deployCommand);
    
    // Parse deployment URL from output
    const urlMatch = stdout.match(/Production: (https:\/\/[^\s]+)/);
    const deployUrl = urlMatch ? urlMatch[1] : 'Check Vercel dashboard';
    
    console.log(`\n${colors.green}✅ Deployment successful!${colors.reset}`);
    console.log(`🌐 Production URL: ${deployUrl}`);
    console.log(`📊 Dashboard: https://vercel.com/dashboard`);
    
    // Log the deployment
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Deployed to Vercel - ${deployUrl}`;
    
    const fs = require('fs');
    const logsPath = require('path').join(__dirname, '..', 'logs', '07162025.log');
    fs.appendFileSync(logsPath, `\n${logEntry}\n`);
    
    return { success: true, url: deployUrl };
    
  } catch (error) {
    console.error(`\n${colors.red}❌ Deployment failed${colors.reset}`);
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('token')) {
      console.log(`\n${colors.yellow}💡 Fix: Ensure 'Vercel_token' is set in .env${colors.reset}`);
    }
    
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  deployToVercel()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployToVercel };