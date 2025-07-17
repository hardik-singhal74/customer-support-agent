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

async function addUrlsToTidio() {
  const urls = extractUrlsFromRoutes();
  
  if (urls.length === 0) {
    console.log('No URLs found to add');
    return;
  }

  console.log(`Starting automation to add the remaining ${urls.length - 211} URLs to Tidio (starting from URL 212)...`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300 // Add delay for better visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to Tidio data sources page
    console.log('Navigating to Tidio data sources page...');
    await page.goto('https://www.tidio.com/panel/lyro-ai/data-sources/added');
    
    // Login using the provided credentials
    console.log('Logging in...');
    await page.getByPlaceholder("Your work email").fill("oliver@mixarrow.com");
    await page.getByPlaceholder("Password").fill("qwer5678");
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;

    // Process URLs one by one, starting from URL 212 (index 211)
    const startIndex = 211; // Start from where we left off
    for (let i = startIndex; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        console.log(`\nProcessing URL ${i + 1}/${urls.length}: ${url}`);
        
        // Click "Add" button
        try {
          await page.getByRole("button", { name: "Add" }).click();
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log(`✗ Could not find Add button for URL: ${url}`);
          errorCount++;
          continue;
        }
        
        // Click on the Website URL option
        await page.getByText('Website URLProvide the URL of').click();
        await page.waitForTimeout(1000);
        
        // Fill in the URL
        await page.getByRole('textbox', { name: 'Website URL' }).fill(url);
        await page.waitForTimeout(1000);
        
        // Click Import knowledge
        await page.getByRole('button', { name: 'Import knowledge' }).click();
        await page.waitForTimeout(2000);
        
        // Check if URL is already in use
        try {
          const duplicateError = page.getByText('URL is already in use in data');
          if (await duplicateError.isVisible({ timeout: 3000 })) {
            console.log(`⚠ URL already exists: ${url}`);
            duplicateCount++;
            // Close the error dialog using the close button
            await page.getByRole('button', { name: 'Close button' }).click();
            await page.waitForTimeout(1000);
            continue;
          }
        } catch (e) {
          // No duplicate error, continue
        }
        
        // Wait for success confirmation
        await page.waitForTimeout(3000);
        
        successCount++;
        console.log(`✓ Successfully added: ${url}`);
        
      } catch (error) {
        console.error(`✗ Error adding URL ${url}:`, error.message);
        errorCount++;
      }
      
      // Small delay between URLs
      await page.waitForTimeout(1000);
    }

    console.log(`\n=== AUTOMATION COMPLETE ===`);
    console.log(`Total URLs processed: ${urls.length - startIndex}`);
    console.log(`✓ Successfully added: ${successCount}`);
    console.log(`⚠ Duplicates skipped: ${duplicateCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log(`Success rate: ${((successCount / (urls.length - startIndex)) * 100).toFixed(1)}%`);
    
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
  console.log('🚀 Starting Tidio URL Import Automation...');
  console.log('Using provided credentials to login automatically.');
  
  addUrlsToTidio().catch(console.error);
}

module.exports = { addUrlsToTidio, extractUrlsFromRoutes };