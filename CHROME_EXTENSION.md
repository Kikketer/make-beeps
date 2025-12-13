# Chrome Extension for BeepBox to MakeCode Arcade Conversion

## Overview

A Chrome extension has been created to streamline the process of converting BeepBox songs to MakeCode Arcade format. This extension solves the localStorage limitation by running directly in the context of the MakeCode Arcade website.

## What's New

The extension provides:

1. **Direct localStorage Access**: Updates `arcade/copyData` directly on the MakeCode Arcade domain
2. **Drag & Drop Interface**: Easy file selection with visual feedback
3. **Custom Song Naming**: Name your songs before conversion
4. **One-Click Workflow**: Convert and paste in seconds

## File Structure

```
extension/
├── manifest.json           # Chrome extension configuration
├── popup.html             # Extension popup UI
├── popup.js               # UI logic and file handling
├── content.js             # Content script for localStorage access
├── converter.js           # Standalone converter (from src/converter.ts)
├── icon16.png            # Extension icons
├── icon48.png
├── icon128.png
├── README.md             # Extension documentation
├── INSTALL.md            # Installation guide
└── test-converter.html   # Test page for converter
```

## How It Works

### Architecture

1. **Popup (popup.html/js)**:
   - Provides the user interface
   - Handles file selection and drag-drop
   - Validates BeepBox JSON
   - Triggers conversion

2. **Converter (converter.js)**:
   - Standalone version of the TypeScript converter
   - Converts BeepBox JSON to MakeCode hex format
   - Generates the paste JSON structure

3. **Content Script (content.js)**:
   - Runs in the context of arcade.makecode.com
   - Has access to the page's localStorage
   - Updates `arcade/copyData` with converted song

### Workflow

```
User selects BeepBox JSON
        ↓
Popup validates and converts
        ↓
Popup sends message to content script
        ↓
Content script updates localStorage
        ↓
User pastes in MakeCode (Ctrl+V)
```

## Installation

See [extension/INSTALL.md](extension/INSTALL.md) for detailed installation instructions.

Quick steps:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder

## Usage

1. Navigate to https://arcade.makecode.com
2. Click the extension icon
3. Enter a song name (optional)
4. Select or drag-drop your BeepBox JSON file
5. Wait for success message
6. Press Ctrl+V (Cmd+V) in MakeCode to paste

## Technical Details

### Permissions Required

- **activeTab**: Check current tab URL
- **scripting**: Inject content script
- **host_permissions** (arcade.makecode.com): Access localStorage

### localStorage Format

The extension writes to `arcade/copyData` with this structure:

```json
{
  "version": 1,
  "data": {
    "paster": "block",
    "blockState": {
      "type": "music_song_field_editor",
      "fields": {
        "song": {
          "version": 1,
          "assetType": "song",
          "assetId": "mySongs.songName",
          "jres": {
            "songName": {
              "data": "hex_encoded_song_data",
              "mimeType": "application/mkcd-song",
              "displayName": "songName",
              "namespace": "mySongs."
            }
          }
        }
      }
    }
  }
}
```

### Security

- Extension only runs on arcade.makecode.com
- No external network requests
- All conversion happens locally
- No data collection or tracking

## Testing

Open `extension/test-converter.html` in a browser to test the converter logic without installing the extension.

## Future Enhancements

Possible improvements:
- Support for multiple file formats
- Batch conversion
- Preview before pasting
- Export to file option
- Settings for default octave/instrument
- Support for drum tracks

## Troubleshooting

### Common Issues

**Extension doesn't load**
- Verify all files are in the extension folder
- Check Chrome console for errors
- Try reloading the extension

**Can't paste in MakeCode**
- Ensure you're on arcade.makecode.com
- Check for success message before pasting
- Try refreshing the MakeCode page
- Click in the workspace before pasting

**Invalid JSON error**
- Verify file is exported from BeepBox
- Check JSON is valid (use a JSON validator)
- Ensure file isn't corrupted

## Development

To modify the extension:

1. Make changes to files in `extension/`
2. Go to `chrome://extensions/`
3. Click reload icon on the extension
4. Test your changes

The converter logic is in `converter.js` - this is a standalone JavaScript version of `src/converter.ts`.

## Comparison with Web App

| Feature | Chrome Extension | Web App |
|---------|-----------------|---------|
| Installation | One-time setup | None needed |
| Paste workflow | Direct (Ctrl+V) | Manual copy/paste |
| localStorage access | Automatic | Not possible |
| Offline use | Yes | Requires server |
| Updates | Manual reload | Automatic |

## License

Same as parent project.
