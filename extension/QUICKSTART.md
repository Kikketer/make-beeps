# Quick Start Guide

## 5-Minute Setup

### 1. Install Extension (2 minutes)

1. Open Chrome and go to `chrome://extensions/`
2. Toggle "Developer mode" ON (top-right)
3. Click "Load unpacked"
4. Navigate to this `extension/` folder and select it
5. You should see "BeepBox to MakeCode Arcade Converter" appear

### 2. Test It (3 minutes)

1. Go to https://arcade.makecode.com
2. Create or open a project
3. Click the extension icon in your toolbar (🎵)
4. You should see: "✅ Ready to convert!"

### 3. Convert Your First Song

1. Open BeepBox (https://beepbox.co)
2. Create a simple melody
3. Click "Export" → "Export to JSON file"
4. Save the JSON file

5. Back in MakeCode Arcade, click the extension icon
6. Drag your JSON file onto the drop zone
7. Wait for "✅ Success!" message
8. Click in the MakeCode workspace
9. Press Ctrl+V (Windows) or Cmd+V (Mac)
10. Your song block appears! 🎉

## What Just Happened?

The extension:
1. Read your BeepBox JSON
2. Converted it to MakeCode's binary format
3. Placed it in MakeCode's "clipboard" (localStorage)
4. Made it ready to paste

## Next Steps

- Try different BeepBox songs
- Experiment with custom song names
- Check out the test files in `../BeepBox/` folder

## Need Help?

- See [INSTALL.md](INSTALL.md) for detailed installation
- See [README.md](README.md) for full documentation
- Check [test-converter.html](test-converter.html) to test conversion

## Tips

- Pin the extension to your toolbar for easy access
- Name your songs descriptively before converting
- You can convert multiple songs - each paste adds a new block
- The extension only works on arcade.makecode.com

## Troubleshooting

**"Please open this extension while on arcade.makecode.com"**
→ You need to be on the MakeCode Arcade website

**Song doesn't paste**
→ Make sure you see the success message first
→ Try clicking in the workspace before pasting
→ Refresh the page if needed

**"Invalid BeepBox JSON format"**
→ Make sure you exported as JSON from BeepBox
→ Check the file isn't corrupted

---

That's it! You're ready to bring BeepBox's powerful music editor to MakeCode Arcade. 🎵✨
