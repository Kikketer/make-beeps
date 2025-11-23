# MakeCode Arcade Audio Converter

Wouldn't you like the power and flexibility of BeepBox but have that produce MakeCode Arcade music?

This tool will convert BeepBox music into MakeCode Arcade music.

## How to Use

1. Open BeepBox and create your music
2. Save the music you create as a JSON file
3. Drag/Drop that JSON file onto this tool
4. You will then have the MakeCode Arcade music in your clipboard

Unfortunately, since MakeCode Arcade decided to use localStorage for their copy/paste routine the next steps kind of suck:

5. Install the chrome plugin "MakeCode Audio Import"
6. Open MakeCode Arcade
7. Open the chrome plugin "MakeCode Audio Import"
8. Click "Import Audio"
9. Paste the MakeCode Arcade music into the "Import Audio" dialog
10. Click "Import"

## Behind the Scenes

The JSON file produced from BeepBox