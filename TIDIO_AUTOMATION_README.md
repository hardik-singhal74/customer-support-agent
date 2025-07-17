# Tidio Automation Script

This script automates the process of adding website URLs to Tidio's Lyro AI data sources.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure the script:**
   Open `tidio-automation.js` and update the `WEBSITE_URLS` array with your website URLs:
   ```javascript
   const WEBSITE_URLS = [
     'https://your-website1.com',
     'https://your-website2.com',
     'https://your-website3.com',
     // Add more URLs as needed
   ];
   ```

## Usage

1. **Run the script:**
   ```bash
   node tidio-automation.js
   ```

2. **Login Process:**
   - The script will open a browser window
   - If you're not logged in to Tidio, it will prompt you to login manually
   - After logging in, press Enter in the terminal to continue

3. **Automation Process:**
   - The script will automatically navigate to the Tidio panel
   - For each URL in the list, it will:
     - Click the "Add" button
     - Select "Website URL" option
     - Enter the URL
     - Click "Import Knowledge"
     - Skip if the URL already exists

## Features

- **Duplicate Detection:** Skips URLs that already exist in your data sources
- **Error Handling:** Continues processing remaining URLs if one fails
- **Visual Feedback:** Shows progress and status for each URL
- **Flexible Selectors:** Uses multiple selector strategies to find UI elements

## Configuration Options

### Browser Settings
- **Headless Mode:** Set `headless: true` to run without UI
- **Slow Motion:** Adjust `slowMo` value to control action speed
- **Viewport:** Modify viewport size if needed

### Selectors
If the Tidio interface changes, you may need to update the selectors in the `SELECTORS` object:
```javascript
const SELECTORS = {
  addButton: 'your-new-selector',
  websiteUrlOption: 'your-new-selector',
  // ... other selectors
};
```

## Troubleshooting

### Common Issues:

1. **Login Required:**
   - Make sure you're logged in to Tidio
   - The script will pause and ask you to login manually

2. **Selectors Not Found:**
   - Tidio may have updated their interface
   - Check the browser console for the actual element selectors
   - Update the selectors in the script

3. **Rate Limiting:**
   - The script includes delays between requests
   - If you get rate limited, increase the timeout values

### Debug Mode:
- Set `headless: false` to see what the script is doing
- Check the console output for detailed logs
- Use browser developer tools to inspect elements

## Example Output

```
🚀 Initializing browser...
🌐 Navigating to Tidio panel...
📋 Processing 3 URLs...

📍 Processing 1/3: https://example1.com
🔘 Looking for Add button...
✅ Add button clicked
🌐 Selecting Website URL option...
✅ Website URL option selected
📝 Entering URL: https://example1.com
✅ URL entered
📥 Clicking Import Knowledge button...
✅ Import button clicked
✅ Successfully processed: https://example1.com

📍 Processing 2/3: https://example2.com
⚠️  URL already exists, skipping...
✅ Successfully processed: https://example2.com

🎉 All URLs processed!
```

## Security Notes

- The script runs in non-headless mode by default for transparency
- Your login credentials are not stored or transmitted
- The script only interacts with the Tidio panel interface

## Support

If you encounter issues:
1. Check that you're logged in to Tidio
2. Verify the website URLs are correct
3. Update selectors if Tidio's interface has changed
4. Check the console output for error messages