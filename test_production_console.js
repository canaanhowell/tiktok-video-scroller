// Test production site console logs
const puppeteer = require('puppeteer');

async function testProductionConsole() {
  console.log('🚀 Testing production site console logs...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capture console logs
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`[BROWSER] ${text}`);
    });
    
    // Navigate to production site
    console.log('🌐 Navigating to https://media.synthetikmedia.ai...');
    await page.goto('https://media.synthetikmedia.ai', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for app to load and log data
    await page.waitForTimeout(5000);
    
    // Look for specific category logs
    const categoryLogs = consoleLogs.filter(log => 
      log.includes('category:') || 
      log.includes('Video categories received') ||
      log.includes('[VideoItem]')
    );
    
    console.log('\n📊 Category-related console logs:');
    categoryLogs.forEach(log => console.log(`  ${log}`));
    
    // Check if any logs show "general" categories
    const generalLogs = consoleLogs.filter(log => log.includes('general'));
    if (generalLogs.length > 0) {
      console.log('\n🚨 Logs containing "general":');
      generalLogs.forEach(log => console.log(`  ${log}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testProductionConsole();