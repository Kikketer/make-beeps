# Installation Guide

## Installing the Chrome Extension

### Step 1: Locate the Extension Folder
The extension files are in the `extension/` folder of this project.

### Step 2: Open Chrome Extensions Page
1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Or click the three-dot menu → More Tools → Extensions

### Step 3: Enable Developer Mode
1. Look for the "Developer mode" toggle in the top-right corner
2. Turn it ON

### Step 4: Load the Extension
1. Click the "Load unpacked" button
2. Navigate to and select the `extension/` folder from this project
3. Click "Select" or "Open"

### Step 5: Verify Installation
You should see "BeepBox to MakeCode Arcade Converter" appear in your extensions list with a musical note icon.

## Using the Extension

### Step 1: Open MakeCode Arcade
Navigate to https://arcade.makecode.com in Chrome

### Step 2: Open the Extension
Click the extension icon in your Chrome toolbar (you may need to pin it first)

### Step 3: Convert Your Song
1. Enter a name for your song (optional)
2. Either:
   - Click the drop zone and select your BeepBox JSON file
   - Drag and drop your BeepBox JSON file onto the extension

### Step 4: Paste in MakeCode
1. Wait for the "Success!" message
2. Click in your MakeCode Arcade workspace
3. Press Ctrl+V (Windows/Linux) or Cmd+V (Mac)
4. Your song block should appear!

## Troubleshooting

### Extension doesn't appear after loading
- Make sure you selected the correct `extension/` folder
- Check that all files are present (manifest.json, popup.html, etc.)
- Try reloading the extension page

### "Please open this extension while on arcade.makecode.com"
- The extension only works on the MakeCode Arcade website
- Make sure you're on https://arcade.makecode.com

### Song doesn't paste
- Verify you see the success message before pasting
- Try refreshing the MakeCode Arcade page
- Make sure you're clicking in the workspace before pasting

### "Invalid BeepBox JSON format"
- Ensure your file is exported from BeepBox as JSON
- Check that the file isn't corrupted
- Try opening the JSON file in a text editor to verify it's valid

## Updating the Extension

If you make changes to the extension code:

1. Go to `chrome://extensions/`
2. Find "BeepBox to MakeCode Arcade Converter"
3. Click the refresh/reload icon
4. The extension will reload with your changes

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "BeepBox to MakeCode Arcade Converter"
3. Click "Remove"
4. Confirm the removal
