const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Extract URLs from routes.md
function extractUrlsFromRoutes() {
  const routesPath = path.join(__dirname, 'routes.md');
  const content = fs.readFileSync(routesPath, 'utf-8');
  
  // Extract all URLs using regex
  const urlRegex = /https?:\/\/[^\s\)]+/g;
  const urls = content.match(urlRegex) || [];
  
  // Remove duplicates and filter out invalid URLs
  const uniqueUrls = [...new Set(urls)].filter(url => {
    // Clean up URL (remove trailing dashes, etc.)
    const cleanedUrl = url.replace(/[-\s]*$/, '');
    return cleanedUrl.startsWith('http') && cleanedUrl.length > 10 && !cleanedUrl.includes('$(date)');
  }).map(url => url.replace(/[-\s]*$/, ''));
  
  console.log(`Found ${uniqueUrls.length} unique URLs to add`);
  return uniqueUrls;
}

async function addUrlsToSupermoon() {
  const urls = extractUrlsFromRoutes();
  
  if (urls.length === 0) {
    console.log('No URLs found to add');
    return;
  }

  console.log(`Starting automation to add ${urls.length} URLs to Supermoon...`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300 // Add delay for better visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to Supermoon knowledge base configure page
    console.log('Navigating to Supermoon knowledge base configure page...');
    await page.goto('https://app.getsupermoon.com/knowledge-base/configure');
    
    // Click "Sign in with email" button
    console.log('Clicking Sign in with email...');
    await page.getByRole("button", { name: "Sign in with email" }).click();
    await page.waitForTimeout(2000);
    
    // Fill in email
    console.log('Filling in email...');
    await page.getByPlaceholder("Enter your email address").fill("oliver@mixarrow.com");
    await page.waitForTimeout(1000);
    
    // Fill in password
    console.log('Filling in password...');
    await page.getByPlaceholder("Enter your password").fill("qvt-pxt!pjw_xej0THF");
    await page.waitForTimeout(1000);
    
    // Click Log In button
    console.log('Clicking Log In button...');
    await page.getByRole("button", { name: "Log In" }).click();
    
    // Wait for login to complete and page to load
    try {
      await page.waitForLoadState('networkidle', { timeout: 60000 });
      console.log('Login completed, waiting for page to load...');
    } catch (error) {
      console.log('Network idle timeout, but continuing...');
      await page.waitForTimeout(5000);
    }
    
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;

    // Process URLs one by one - Add all URLs first, then save at the end
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        console.log(`\nProcessing URL ${i + 1}/${urls.length}: ${url}`);
        
        // Wait for Add New URL button to be enabled (up to 5 minutes)
        console.log('Waiting for Add New URL button to be enabled...');
        await page.waitForSelector('button:has-text("Add New URL"):not([disabled])', { 
          timeout: 300000 // 5 minutes timeout
        });
        
        // Click Add New URL button
        console.log('Clicking Add New URL button...');
        await page.getByRole("button", { name: "Add New URL" }).click();
        await page.waitForTimeout(1000);
        
        // Click and fill in the URL in the placeholder field (target the last/newest input)
        console.log(`Clicking and filling in URL: ${url}`);
        await page.getByPlaceholder("example.com/page").last().click();
        await page.getByPlaceholder("example.com/page").last().fill(url);
        await page.waitForTimeout(1000);
        
        successCount++;
        console.log(`✓ Successfully added URL to form: ${url}`);
        
      } catch (error) {
        console.error(`✗ Error adding URL ${url}:`, error.message);
        errorCount++;
        
        // Try to recover by refreshing the page if needed
        if (error.message.includes('timeout')) {
          console.log('Timeout occurred, refreshing page...');
          await page.reload();
          await page.waitForLoadState('networkidle', { timeout: 30000 });
        }
      }
      
      // Small delay between URLs
      await page.waitForTimeout(1000);
    }
    
    // After all URLs are added, click Save button once
    console.log('\n=== All URLs added to form, now saving... ===');
    try {
      console.log('Clicking Save button to save all URLs...');
      await page.getByRole("button", { name: "Save" }).click();
      await page.waitForTimeout(5000);
      
      // Check for any error messages after saving
      try {
        const errorElement = page.locator('[role="alert"], .error-message, .text-red-500');
        if (await errorElement.isVisible({ timeout: 3000 })) {
          const errorText = await errorElement.textContent();
          console.log(`⚠ Error after saving: ${errorText}`);
        } else {
          console.log('✓ All URLs saved successfully!');
        }
      } catch (e) {
        console.log('✓ Save completed (no error messages detected)');
      }
      
    } catch (error) {
      console.error('✗ Error clicking Save button:', error.message);
    }

    console.log(`\n=== AUTOMATION COMPLETE ===`);
    console.log(`Total URLs processed: ${urls.length}`);
    console.log(`✓ Successfully added: ${successCount}`);
    console.log(`⚠ Duplicates skipped: ${duplicateCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log(`Success rate: ${((successCount / urls.length) * 100).toFixed(1)}%`);
    
    // Keep browser open for manual verification
    console.log('\nBrowser will remain open for manual verification...');
    console.log('Press Ctrl+C to close the browser when done.');
    
    // Wait indefinitely until user closes
    await page.waitForTimeout(300000); // 5 minutes, then auto-close

  } catch (error) {
    console.error('Error during automation:', error);
  } finally {
    await browser.close();
  }
}

// Run the automation
if (require.main === module) {
  console.log('🚀 Starting Supermoon URL Import Automation...');
  console.log('Using provided credentials to login automatically.');
  
  addUrlsToSupermoon().catch(console.error);
}

module.exports = { addUrlsToSupermoon, extractUrlsFromRoutes };