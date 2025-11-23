# MakeCode Arcade Music Format - Findings

## Note Encoding Mystery - SOLVED! ✓

### The Problem
The MakeCode Arcade source code (`music.ts`) documents the note encoding formula as:
```
encodedNote = (midiNote - (octave - 2) * 12) | (flags << 6)
```

However, actual output shows a **+1 offset** from this formula!

### The Discovery

Analyzing the test cases with BeepBox pitches (standard MIDI) and MakeCode output:

| BeepBox Pitch | Note | Expected (formula) | Actual Output | Difference |
|---------------|------|-------------------|---------------|------------|
| 60 | C4 | 36 (0x24) | 37 (0x25) | **+1** |
| 59 | B3 | 35 (0x23) | 36 (0x24) | **+1** |
| 57 | A3 | 33 (0x21) | 34 (0x22) | **+1** |

### The Actual Formula (with octave = 4)

```typescript
// What it SHOULD be according to docs:
encodedNote = (midiNote - (octave - 2) * 12)

// What it ACTUALLY is:
encodedNote = (midiNote - (octave - 2) * 12) + 1

// Simplified for octave 4:
encodedNote = midiNote - 23
```

### Conversion Function

```typescript
function beepBoxPitchToMakeCode(
  beepboxPitch: number, 
  makeCodeOctave: number = 4
): number {
  const octaveOffset = (makeCodeOctave - 2) * 12;
  return (beepboxPitch - octaveOffset) + 1;
}

// Examples:
beepBoxPitchToMakeCode(60, 4) // => 37 (C)
beepBoxPitchToMakeCode(59, 4) // => 36 (B)
beepBoxPitchToMakeCode(57, 4) // => 34 (A)
```

### Binary Format Structure

#### Song Header (7 bytes)
- `[0]` version (0)
- `[1-2]` BPM (16-bit little-endian)
- `[3]` beats per measure
- `[4]` ticks per beat
- `[5]` measures
- `[6]` number of tracks

#### Track (variable length)
- `[0]` track ID
- `[1]` flags (0 = melodic, 1 = drums)
- `[2-3]` instrument byte length (16-bit LE)
- `[4...]` instrument data (28 bytes if melodic)
- `[...]` notes byte length (16-bit LE) **← Important: 16-bit, not 32-bit!**
- `[...]` note events

#### Instrument (28 bytes for melodic)
- `[0]` waveform
- `[1-2]` amp attack (16-bit LE)
- `[3-4]` amp decay
- `[5-6]` amp sustain
- `[7-8]` amp release
- `[9-10]` amp amplitude
- `[11-12]` pitch attack
- `[13-14]` pitch decay
- `[15-16]` pitch sustain
- `[17-18]` pitch release
- `[19-20]` pitch amplitude
- `[21]` amp LFO freq
- `[22-23]` amp LFO amp (16-bit LE)
- `[24]` pitch LFO freq
- `[25-26]` pitch LFO amp (16-bit LE)
- `[27]` **octave** ← Key for note conversion!

#### Note Event (5 + polyphony bytes)
- `[0-1]` start tick (16-bit LE)
- `[2-3]` end tick (16-bit LE)
- `[4]` polyphony (number of notes)
- `[5...]` note bytes (1 byte each)

#### Note Byte (1 byte)
- Lower 6 bits (`& 0x3f`): note value (with +1 offset!)
- Upper 2 bits (`>> 6`): enharmonic spelling
  - 0 = normal
  - 1 = flat
  - 2 = sharp

### Test Cases

**One note (C):**
```
Hex: 0078000408020100001c00010a006400f4016400000400000000000000000000000000050000041200000004000125
              ^^                                                                      ^^          ^^
              octave=4                                                                notes=18    note=0x25
```

**Two notes (C, B):**
```
Hex: ...041200000004000125040008000124
        ^^          ^^    ^^          ^^
        18 bytes    C=37  B=36        (each note event is 6 bytes)
```

**Three notes (C, B, A):**
```
Hex: ...0412000000040001250400080001240800 0c000122
        ^^          ^^    ^^          ^^          ^^
        18 bytes    C=37  B=36        A=34        (6 bytes each)
```

### Next Steps

Now that we understand the encoding, we can:
1. ✅ Convert BeepBox MIDI pitches to MakeCode note values
2. ⬜ Handle timing conversion (BeepBox ticks → MakeCode ticks)
3. ⬜ Map instrument parameters
4. ⬜ Build complete converter
