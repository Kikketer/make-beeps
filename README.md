# MakeCode Arcade Audio Converter

Wouldn't you like the power and flexibility of BeepBox but have that produce MakeCode Arcade music?

This tool will convert BeepBox music into MakeCode Arcade music.

## How to Use

### Option 1: Chrome Extension (Recommended)

1. Open BeepBox and create your music
2. Save the music you create as a JSON file
3. Install the Chrome extension from the `extension/` folder (see [extension/README.md](extension/README.md))
4. Open MakeCode Arcade (https://arcade.makecode.com)
5. Click the extension icon and drag/drop your BeepBox JSON file
6. Press Ctrl+V (Cmd+V on Mac) in MakeCode Arcade to paste your song!

### Option 2: Web App

1. Open BeepBox and create your music
2. Save the music you create as a JSON file
3. Run this web app with `npm run dev`
4. Drag/Drop that JSON file onto the tool
5. Copy the generated output and manually paste it into MakeCode Arcade

**Note:** MakeCode Arcade uses localStorage for their copy/paste routine instead of the system clipboard, which is why the Chrome extension is the easiest solution.

## Behind the Scenes

The JSON file produced from BeepBox