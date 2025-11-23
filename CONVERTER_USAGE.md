# BeepBox to MakeCode Arcade Converter - Usage Guide

## ✅ Status: Working!

The converter successfully transforms BeepBox JSON files into MakeCode Arcade hex format.

## Key Findings

### Note Encoding Formula
```typescript
encodedNote = (beepboxPitch - (octave - 2) * 12) + 1

// For octave 4 (simplified):
encodedNote = beepboxPitch - 23
```

### Examples
- BeepBox pitch 60 (C4) with octave 4 → MakeCode 37 (0x25) ✓
- BeepBox pitch 59 (B3) with octave 4 → MakeCode 36 (0x24) ✓
- BeepBox pitch 57 (A3) with octave 4 → MakeCode 34 (0x22) ✓

## Usage

```typescript
import { convertBeepBoxToMakeCode, generatePasteJSON } from './src/converter';
import { readFileSync, writeFileSync } from 'fs';

// Load BeepBox JSON
const beepboxSong = JSON.parse(readFileSync('./BeepBox/my-song.json', 'utf-8'));

// Convert to MakeCode hex
const hexString = convertBeepBoxToMakeCode(beepboxSong);
console.log(hexString);

// Or generate full paste.json for MakeCode
const pasteJson = generatePasteJSON(beepboxSong, 'mySong');
writeFileSync('./output/paste.json', JSON.stringify(pasteJson, null, 2));
```

## Test Results

```bash
npm test -- --run src/converter.test.ts
```

✅ All tests passing!
- Converts C-B-A song correctly
- Note encoding verified

## Binary Format

### Song Header (7 bytes)
```
[0]   version (0)
[1-2] BPM (16-bit LE)
[3]   beats per measure  
[4]   ticks per beat
[5]   measures
[6]   number of tracks
```

### Track Structure
```
[0]   track ID
[1]   flags (0 = melodic, 1 = drums)
[2-3] instrument length (16-bit LE) - typically 28 bytes
[...] instrument data (28 bytes)
[...] notes length (16-bit LE) ← IMPORTANT: 16-bit, not 32-bit!
[...] note events
```

### Instrument (28 bytes)
The exact bytes used:
```
0x01       - waveform (square wave)
0x0a, 0x00 - amp attack (10)
0x64, 0x00 - amp decay (100)
0xf4, 0x01 - amp sustain (500)
0x64, 0x00 - amp release (100)
0x00, 0x04 - amp amplitude (1024 in LE)
0x00, 0x00 - pitch attack (0)
0x00, 0x00 - pitch decay (0)
0x00, 0x00 - pitch sustain (0)
0x00, 0x00 - pitch release (0)
0x00, 0x00 - pitch amp (0)
0x00       - amp LFO freq (0)
0x00, 0x00 - amp LFO amp (0)
0x05       - pitch LFO freq (5)
0x00, 0x00 - pitch LFO amp (0)
octave     - octave value (typically 4)
```

### Note Event (5 + polyphony bytes)
```
[0-1] start tick (16-bit LE)
[2-3] end tick (16-bit LE)
[4]   polyphony (number of simultaneous notes)
[5+]  note values (1 byte each)
```

### Note Byte Encoding
```
Lower 6 bits: note value = (midiPitch - (octave - 2) * 12) + 1
Upper 2 bits: enharmonic (0=normal, 1=flat, 2=sharp)
```
