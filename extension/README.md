# BeepBox to MakeCode Arcade Chrome Extension

This Chrome extension converts BeepBox JSON files to MakeCode Arcade format and automatically places them in the clipboard (via localStorage) for easy pasting into your MakeCode Arcade projects.

## Features

- 🎵 Convert BeepBox songs to MakeCode Arcade format
- 📁 Drag & drop or file selection support
- 🎯 Direct integration with MakeCode Arcade's copy/paste system
- ✨ Custom song naming
- 🚀 One-click conversion and paste

## How It Works

MakeCode Arcade uses a custom copy/paste system that stores clipboard data in `localStorage` at the key `arcade/copyData` instead of using the system clipboard. This extension:

1. Takes your BeepBox JSON file
2. Converts it to MakeCode Arcade's binary song format
3. Updates the `arcade/copyData` localStorage key on the MakeCode Arcade domain
4. Allows you to paste the song directly into your project using Ctrl+V (Cmd+V on Mac)

## Installation

### From Source (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension should now appear in your extensions list

## Usage

1. **Open MakeCode Arcade**: Navigate to https://arcade.makecode.com
2. **Open the Extension**: Click the extension icon in your Chrome toolbar
3. **Select Your Song Name**: Enter a custom name for your song (default: "convertedSong")
4. **Load BeepBox JSON**: Either:
   - Click the drop zone and select your BeepBox JSON file
   - Drag and drop your BeepBox JSON file onto the drop zone
5. **Wait for Conversion**: The extension will convert your song and update localStorage
6. **Paste in MakeCode**: Go to your MakeCode Arcade project and press Ctrl+V (Cmd+V on Mac) to paste the song block

## Requirements

- Chrome browser (or Chromium-based browser)
- Access to https://arcade.makecode.com
- BeepBox JSON file (exported from BeepBox)

## File Structure

```
extension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic and file handling
├── content.js         # Content script for localStorage access
├── converter.js       # BeepBox to MakeCode conversion logic
├── nes.min.css        # NES.css styling
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
└── icon128.png        # Extension icon (128x128)
```

## Permissions

The extension requires the following permissions:

- **activeTab**: To check if you're on the MakeCode Arcade domain
- **scripting**: To inject the content script that updates localStorage
- **host_permissions** (arcade.makecode.com): To access and modify localStorage on the MakeCode Arcade domain

## Troubleshooting

### "Please open this extension while on arcade.makecode.com"

- Make sure you're on the correct domain before opening the extension
- The extension only works on https://arcade.makecode.com/*

### "Invalid BeepBox JSON format"

- Ensure your file is a valid BeepBox JSON export
- Check that the file contains `channels` and `beatsPerBar` properties

### Song doesn't paste

- Make sure you see the success message before attempting to paste
- Try clicking in the MakeCode Arcade workspace before pasting
- Refresh the MakeCode Arcade page and try again

## Development

The converter logic is based on reverse-engineering the MakeCode Arcade song format. See the main project's `FINDINGS.md` for technical details about the conversion process.

## License

Same as the parent project.
