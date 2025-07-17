const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Extract URLs from routes.md
function extractUrlsFromRoutesFile() {
  const routesPath = path.join(__dirname, 'routes.md');
  const content = fs.readFileSync(routesPath, 'utf-8');
  
  // Extract all help.neetocal.com URLs
  const urlRegex = /https:\/\/help\.neetocal\.com[^\s)]*/g;
  const urls = content.match(urlRegex) || [];
  
  // Remove duplicates and filter out incomplete URLs
  const uniqueUrls = [...new Set(urls)].filter(url => 
    url.includes('help.neetocal.com') && !url.endsWith('-')
  );
  
  console.log(`Found ${uniqueUrls.length} unique URLs from routes.md`);
  return uniqueUrls;
}

class TidioAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.urls = extractUrlsFromRoutesFile();
  }

  async init() {
    console.log('🚀 Starting Playwright browser...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // Slow down for visibility
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async navigateToTidio() {
    console.log('🌐 Navigating to Tidio panel...');
    await this.page.goto('https://www.tidio.com/panel/lyro-ai/data-sources/added', {
      waitUntil: 'networkidle'
    });

    // Check if login is required
    const currentUrl = this.page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log('⚠️  Please log in to Tidio manually...');
      console.log('Press Enter in the terminal when you\'re logged in and on the data sources page.');
      
      // Wait for user input
      await this.waitForEnter();
      
      // Navigate to the data sources page again
      await this.page.goto('https://www.tidio.com/panel/lyro-ai/data-sources/added', {
        waitUntil: 'networkidle'
      });
    }
  }

  async waitForEnter() {
    return new Promise((resolve) => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Press Enter to continue...', () => {
        readline.close();
        resolve();
      });
    });
  }

  async addWebsiteUrl(url) {
    try {
      console.log(`\n📝 Adding URL: ${url}`);

      // Look for and click the Add button
      const addButton = await this.page.locator('text=Add').or(
        this.page.locator('button:has-text("Add")')
      ).or(
        this.page.locator('[data-testid*="add"]')
      ).first();

      if (await addButton.isVisible()) {
        await addButton.click();
        console.log('✅ Clicked Add button');
      } else {
        console.log('❌ Add button not found');
        return false;
      }

      await this.page.waitForTimeout(1000);

      // Look for Website URL option
      const websiteOption = await this.page.locator('text=Website').or(
        this.page.locator('text=Website URL')
      ).or(
        this.page.locator('button:has-text("Website")')
      ).first();

      if (await websiteOption.isVisible()) {
        await websiteOption.click();
        console.log('✅ Selected Website option');
      } else {
        console.log('❌ Website option not found');
        return false;
      }

      await this.page.waitForTimeout(1000);

      // Find URL input field
      const urlInput = await this.page.locator('input[type="url"]').or(
        this.page.locator('input[placeholder*="URL"]')
      ).or(
        this.page.locator('input[placeholder*="url"]')
      ).or(
        this.page.locator('input[name*="url"]')
      ).first();

      if (await urlInput.isVisible()) {
        await urlInput.click();
        await urlInput.fill(url);
        console.log('✅ Entered URL');
      } else {
        console.log('❌ URL input field not found');
        return false;
      }

      await this.page.waitForTimeout(1000);

      // Check if URL already exists
      const errorText = await this.page.textContent('body');
      if (errorText.toLowerCase().includes('already exists') || 
          errorText.toLowerCase().includes('duplicate')) {
        console.log('⚠️  URL already exists, skipping...');
        
        // Close modal/dialog
        await this.closeDialog();
        return true;
      }

      // Click Import/Submit button
      const importButton = await this.page.locator('text=Import').or(
        this.page.locator('text=Submit')
      ).or(
        this.page.locator('button:has-text("Import")')
      ).or(
        this.page.locator('button:has-text("Submit")')
      ).first();

      if (await importButton.isVisible()) {
        await importButton.click();
        console.log('✅ Clicked Import button');
      } else {
        console.log('❌ Import button not found');
        return false;
      }

      // Wait for processing
      await this.page.waitForTimeout(3000);

      console.log('✅ URL processed successfully');
      return true;

    } catch (error) {
      console.log(`❌ Error adding URL: ${error.message}`);
      await this.closeDialog();
      return false;
    }
  }

  async closeDialog() {
    try {
      // Try various ways to close modal/dialog
      const closeSelectors = [
        '[aria-label="Close"]',
        '.modal-close',
        'button:has-text("Cancel")',
        'button:has-text("Close")',
        '[data-testid*="close"]'
      ];

      for (const selector of closeSelectors) {
        const element = this.page.locator(selector);
        if (await element.isVisible()) {
          await element.click();
          break;
        }
      }

      // Also try pressing Escape
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.log('Could not close dialog, continuing...');
    }
  }

  async run() {
    try {
      await this.init();
      await this.navigateToTidio();

      console.log(`\n📋 Starting to process ${this.urls.length} URLs...`);
      
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (let i = 0; i < this.urls.length; i++) {
        const url = this.urls[i];
        console.log(`\n📍 Processing ${i + 1}/${this.urls.length}: ${url}`);
        
        const result = await this.addWebsiteUrl(url);
        
        if (result) {
          successCount++;
        } else {
          errorCount++;
        }

        // Wait between requests to avoid rate limiting
        await this.page.waitForTimeout(2000);
      }

      console.log('\n🎉 Processing complete!');
      console.log(`✅ Success: ${successCount}`);
      console.log(`⚠️  Skipped: ${skipCount}`);
      console.log(`❌ Errors: ${errorCount}`);

    } catch (error) {
      console.error('❌ Script error:', error);
    } finally {
      if (this.browser) {
        console.log('\nClosing browser in 10 seconds...');
        await this.page.waitForTimeout(10000);
        await this.browser.close();
      }
    }
  }
}

// Run the automation
const automation = new TidioAutomation();
automation.run().catch(console.error);