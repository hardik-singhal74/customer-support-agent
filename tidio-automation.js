const puppeteer = require('puppeteer');

// Configuration
const TIDIO_PANEL_URL = 'https://www.tidio.com/panel/lyro-ai/data-sources/added';
const WEBSITE_URLS = [
  'https://example1.com',
  'https://example2.com',
  'https://example3.com',
  // Add your website URLs here
];

// Selectors (these may need to be updated based on the actual Tidio interface)
const SELECTORS = {
  addButton: '[data-testid="add-button"], .add-button, button[aria-label="Add"], button:contains("Add")',
  websiteUrlOption: '[data-testid="website-url"], .website-url-option, button:contains("Website URL")',
  urlInput: 'input[type="url"], input[placeholder*="URL"], input[name="url"]',
  importButton: '[data-testid="import"], button:contains("Import Knowledge"), .import-button',
  existingUrlIndicator: '.already-exists, .duplicate, [data-testid="existing"]',
  closeModal: '.modal-close, [data-testid="close"], button[aria-label="Close"]'
};

class TidioAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to true if you want to run without UI
      slowMo: 100, // Slow down actions for better visibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    
    // Set a reasonable viewport size
    await this.page.setViewport({ width: 1200, height: 800 });
    
    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }

  async navigateToTidio() {
    console.log('🌐 Navigating to Tidio panel...');
    await this.page.goto(TIDIO_PANEL_URL, { waitUntil: 'networkidle2' });
    
    // Wait for the page to load completely
    await this.page.waitForTimeout(3000);
    
    // Check if we need to login
    const currentUrl = this.page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log('⚠️  Login required. Please log in manually and press Enter to continue...');
      await this.waitForUserInput();
      await this.page.goto(TIDIO_PANEL_URL, { waitUntil: 'networkidle2' });
    }
  }

  async waitForUserInput() {
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

  async clickAddButton() {
    console.log('🔘 Looking for Add button...');
    
    // Try multiple selectors for the add button
    const addSelectors = [
      'button:contains("Add")',
      '[data-testid="add-button"]',
      '.add-button',
      'button[aria-label="Add"]',
      '.btn-add',
      'button.add'
    ];

    for (const selector of addSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        await this.page.click(selector);
        console.log('✅ Add button clicked');
        return true;
      } catch (error) {
        console.log(`❌ Selector ${selector} not found`);
      }
    }

    // If no selector worked, try clicking by text
    try {
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const addButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('add') ||
          btn.getAttribute('aria-label')?.toLowerCase().includes('add')
        );
        if (addButton) {
          addButton.click();
          return true;
        }
        return false;
      });
      console.log('✅ Add button clicked (by text search)');
      return true;
    } catch (error) {
      console.log('❌ Could not find Add button');
      return false;
    }
  }

  async selectWebsiteUrl() {
    console.log('🌐 Selecting Website URL option...');
    
    await this.page.waitForTimeout(1000);
    
    const websiteSelectors = [
      'button:contains("Website URL")',
      '[data-testid="website-url"]',
      '.website-url-option',
      'button[aria-label*="Website"]'
    ];

    for (const selector of websiteSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        await this.page.click(selector);
        console.log('✅ Website URL option selected');
        return true;
      } catch (error) {
        console.log(`❌ Selector ${selector} not found`);
      }
    }

    // Try clicking by text
    try {
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, div, span'));
        const websiteButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('website url') ||
          btn.textContent.toLowerCase().includes('website')
        );
        if (websiteButton) {
          websiteButton.click();
          return true;
        }
        return false;
      });
      console.log('✅ Website URL option selected (by text search)');
      return true;
    } catch (error) {
      console.log('❌ Could not find Website URL option');
      return false;
    }
  }

  async inputWebsiteUrl(url) {
    console.log(`📝 Entering URL: ${url}`);
    
    await this.page.waitForTimeout(1000);
    
    const inputSelectors = [
      'input[type="url"]',
      'input[placeholder*="URL"]',
      'input[name="url"]',
      'input[data-testid="url-input"]',
      '.url-input',
      'input[type="text"]'
    ];

    for (const selector of inputSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        await this.page.click(selector);
        await this.page.keyboard.selectAll();
        await this.page.type(selector, url);
        console.log('✅ URL entered');
        return true;
      } catch (error) {
        console.log(`❌ Input selector ${selector} not found`);
      }
    }

    console.log('❌ Could not find URL input field');
    return false;
  }

  async clickImportButton() {
    console.log('📥 Clicking Import Knowledge button...');
    
    await this.page.waitForTimeout(1000);
    
    const importSelectors = [
      'button:contains("Import Knowledge")',
      '[data-testid="import"]',
      '.import-button',
      'button[aria-label*="Import"]',
      'button:contains("Import")'
    ];

    for (const selector of importSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        await this.page.click(selector);
        console.log('✅ Import button clicked');
        return true;
      } catch (error) {
        console.log(`❌ Import selector ${selector} not found`);
      }
    }

    // Try clicking by text
    try {
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const importButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('import knowledge') ||
          btn.textContent.toLowerCase().includes('import')
        );
        if (importButton) {
          importButton.click();
          return true;
        }
        return false;
      });
      console.log('✅ Import button clicked (by text search)');
      return true;
    } catch (error) {
      console.log('❌ Could not find Import button');
      return false;
    }
  }

  async checkIfUrlExists(url) {
    console.log(`🔍 Checking if URL already exists: ${url}`);
    
    try {
      // Check if there's an indicator that the URL already exists
      const exists = await this.page.evaluate((url) => {
        const text = document.body.textContent.toLowerCase();
        return text.includes('already exists') || 
               text.includes('duplicate') || 
               text.includes('already added') ||
               document.querySelector('.already-exists, .duplicate, [data-testid="existing"]');
      }, url);

      if (exists) {
        console.log('⚠️  URL already exists, skipping...');
        return true;
      }

      return false;
    } catch (error) {
      console.log('❌ Error checking URL existence:', error.message);
      return false;
    }
  }

  async closeModal() {
    console.log('❌ Closing modal...');
    
    const closeSelectors = [
      '.modal-close',
      '[data-testid="close"]',
      'button[aria-label="Close"]',
      '.close-button',
      '[data-dismiss="modal"]'
    ];

    for (const selector of closeSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 1000 });
        await this.page.click(selector);
        console.log('✅ Modal closed');
        return true;
      } catch (error) {
        // Continue to next selector
      }
    }

    // Try pressing Escape key
    try {
      await this.page.keyboard.press('Escape');
      console.log('✅ Modal closed with Escape key');
      return true;
    } catch (error) {
      console.log('❌ Could not close modal');
      return false;
    }
  }

  async processUrl(url) {
    console.log(`\n🔄 Processing URL: ${url}`);
    
    try {
      // Click Add button
      if (!(await this.clickAddButton())) {
        console.log('❌ Failed to click Add button');
        return false;
      }

      await this.page.waitForTimeout(2000);

      // Select Website URL option
      if (!(await this.selectWebsiteUrl())) {
        console.log('❌ Failed to select Website URL option');
        await this.closeModal();
        return false;
      }

      await this.page.waitForTimeout(2000);

      // Input the URL
      if (!(await this.inputWebsiteUrl(url))) {
        console.log('❌ Failed to input URL');
        await this.closeModal();
        return false;
      }

      await this.page.waitForTimeout(2000);

      // Check if URL already exists
      if (await this.checkIfUrlExists(url)) {
        await this.closeModal();
        return true; // Skip to next URL
      }

      // Click Import Knowledge button
      if (!(await this.clickImportButton())) {
        console.log('❌ Failed to click Import button');
        await this.closeModal();
        return false;
      }

      // Wait for the import to complete
      await this.page.waitForTimeout(5000);

      console.log('✅ URL processed successfully');
      return true;

    } catch (error) {
      console.log(`❌ Error processing URL ${url}:`, error.message);
      await this.closeModal();
      return false;
    }
  }

  async run() {
    try {
      await this.init();
      await this.navigateToTidio();

      console.log(`\n📋 Processing ${WEBSITE_URLS.length} URLs...`);

      for (let i = 0; i < WEBSITE_URLS.length; i++) {
        const url = WEBSITE_URLS[i];
        console.log(`\n📍 Processing ${i + 1}/${WEBSITE_URLS.length}: ${url}`);
        
        const success = await this.processUrl(url);
        
        if (success) {
          console.log(`✅ Successfully processed: ${url}`);
        } else {
          console.log(`❌ Failed to process: ${url}`);
        }

        // Wait between requests to avoid rate limiting
        await this.page.waitForTimeout(3000);
      }

      console.log('\n🎉 All URLs processed!');

    } catch (error) {
      console.error('❌ Script error:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the automation
const automation = new TidioAutomation();
automation.run().catch(console.error);