// BeepBox to MakeCode Arcade converter

interface BeepBoxNote {
  pitches: number[];
  points: Array<{
    tick: number;
    pitchBend: number;
    volume: number;
  }>;
  continuesLastPattern?: boolean;
}

interface BeepBoxPattern {
  notes: BeepBoxNote[];
}

interface BeepBoxChannel {
  type: string;
  instruments: unknown[];
  patterns: BeepBoxPattern[];
  sequence: number[];
  octaveScrollBar?: number;
}

interface BeepBoxSong {
  format: string;
  version: number;
  scale: string;
  key: string;
  introBars: number;
  loopBars: number;
  beatsPerBar: number;
  ticksPerBeat: number;
  beatsPerMinute: number;
  channels: BeepBoxChannel[];
}

interface MakeCodeNoteEvent {
  startTick: number;
  endTick: number;
  notes: number[];
}

/**
 * Convert BeepBox pitch to MakeCode note value
 * 
 * Formula discovered from analysis:
 * encodedNote = (beepboxPitch - (octave - 2) * 12) + 1
 * 
 * For octave 4: encodedNote = beepboxPitch - 23
 * 
 * Examples:
 * - BeepBox 60 (C4) -> MakeCode 37 (0x25)
 * - BeepBox 59 (B3) -> MakeCode 36 (0x24)
 * - BeepBox 57 (A3) -> MakeCode 34 (0x22)
 */
function beepBoxPitchToMakeCodeNote(pitch: number, octave: number): number {
  return beepBoxPitchToMakeCodeNoteWithVersion(pitch, octave, 6);
}

function beepBoxPitchToMakeCodeNoteWithVersion(pitch: number, octave: number, beepBoxVersion: number): number {
  if (beepBoxVersion >= 9) {
    return pitch - 35;
  }

  const octaveOffset = (octave - 2) * 12;
  return (pitch - octaveOffset) + 1;
}

/**
 * Create instrument bytes (28 bytes)
 * Exact bytes from working MakeCode examples
 */
function createInstrumentBytes(octave: number = 4): number[] {
  return [
    0x01,       // [0] waveform (1 = square wave)
    0x0a, 0x00, // [1-2] amp attack (10)
    0x64, 0x00, // [3-4] amp decay (100)
    0xf4, 0x01, // [5-6] amp sustain (500)
    0x64, 0x00, // [7-8] amp release (100)
    0x00, 0x04, // [9-10] amp amp (1024 in little-endian)
    0x00, 0x00, // [11-12] pitch attack (0)
    0x00, 0x00, // [13-14] pitch decay (0)
    0x00, 0x00, // [15-16] pitch sustain (0)
    0x00, 0x00, // [17-18] pitch release (0)
    0x00, 0x00, // [19-20] pitch amp (0)
    0x00,       // [21] amp lfo freq (0)
    0x00, 0x00, // [22-23] amp lfo amp (0)
    0x05,       // [24] pitch lfo freq (5)
    0x00, 0x00, // [25-26] pitch lfo amp (0)
    octave      // [27] octave (typically 4)
  ];
}

const MAKECODE_BEATS_PER_MEASURE = 4;
const MAKECODE_TICKS_PER_BEAT = 8;

const MAKECODE_PRESET_INSTRUMENT_BYTES: Record<number, number[]> = {
  0: [0x01, 0x0a, 0x00, 0x64, 0x00, 0xf4, 0x01, 0x64, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x04],
  1: [0x0f, 0x05, 0x00, 0x12, 0x02, 0xc1, 0x02, 0xc2, 0x01, 0x00, 0x04, 0x05, 0x00, 0x28, 0x00, 0x00, 0x00, 0x64, 0x00, 0x28, 0x00, 0x03, 0x05, 0x00, 0x06, 0x00, 0x00, 0x04],
  2: [0x0c, 0x96, 0x00, 0x64, 0x00, 0x6d, 0x01, 0x90, 0x01, 0x00, 0x04, 0x78, 0x00, 0x2c, 0x01, 0x00, 0x00, 0x64, 0x00, 0x32, 0x00, 0x00, 0x78, 0x00, 0x0a, 0x01, 0x00, 0x05],
};

function createInstrumentBytesFromMakeCodeParams(params: {
  waveform: number;
  octave: number;
  ampEnvelope: { attack: number; decay: number; sustain: number; release: number; amplitude: number };
  pitchEnvelope?: { attack: number; decay: number; sustain: number; release: number; amplitude: number };
  ampLFO?: { frequency: number; amplitude: number };
  pitchLFO?: { frequency: number; amplitude: number };
}): number[] {
  const out: number[] = [];

  out.push(params.waveform);
  out.push(...writeUint16LE(params.ampEnvelope.attack));
  out.push(...writeUint16LE(params.ampEnvelope.decay));
  out.push(...writeUint16LE(params.ampEnvelope.sustain));
  out.push(...writeUint16LE(params.ampEnvelope.release));
  out.push(...writeUint16LE(params.ampEnvelope.amplitude));

  out.push(...writeUint16LE(params.pitchEnvelope?.attack || 0));
  out.push(...writeUint16LE(params.pitchEnvelope?.decay || 0));
  out.push(...writeUint16LE(params.pitchEnvelope?.sustain || 0));
  out.push(...writeUint16LE(params.pitchEnvelope?.release || 0));
  out.push(...writeUint16LE(params.pitchEnvelope?.amplitude || 0));

  out.push(params.ampLFO?.frequency || 0);
  out.push(...writeUint16LE(params.ampLFO?.amplitude || 0));
  out.push(params.pitchLFO?.frequency || 0);
  out.push(...writeUint16LE(params.pitchLFO?.amplitude || 0));
  out.push(params.octave);

  return out;
}

function getInstrumentBytesForTrack(trackId: number, fallbackOctave: number): number[] {
  const preset = MAKECODE_PRESET_INSTRUMENT_BYTES[trackId];
  if (preset) return preset;

  const fallback = MAKECODE_PRESET_INSTRUMENT_PARAMS[trackId];
  if (fallback) return createInstrumentBytesFromMakeCodeParams(fallback);

  return createInstrumentBytes(fallbackOctave);
}

const MAKECODE_PRESET_INSTRUMENT_PARAMS: Record<number, {
  waveform: number;
  octave: number;
  ampEnvelope: { attack: number; decay: number; sustain: number; release: number; amplitude: number };
  pitchEnvelope?: { attack: number; decay: number; sustain: number; release: number; amplitude: number };
  ampLFO?: { frequency: number; amplitude: number };
  pitchLFO?: { frequency: number; amplitude: number };
}> = {
  3: {
    waveform: 1,
    octave: 3,
    ampEnvelope: { attack: 220, decay: 105, sustain: 1024, release: 350, amplitude: 1024 },
    ampLFO: { frequency: 5, amplitude: 100 },
    pitchLFO: { frequency: 1, amplitude: 4 },
  },
  4: {
    waveform: 16,
    octave: 4,
    ampEnvelope: { attack: 5, decay: 100, sustain: 1024, release: 30, amplitude: 1024 },
    pitchLFO: { frequency: 10, amplitude: 4 },
  },
  5: {
    waveform: 15,
    octave: 2,
    ampEnvelope: { attack: 10, decay: 100, sustain: 500, release: 10, amplitude: 1024 },
  },
  6: {
    waveform: 1,
    octave: 2,
    ampEnvelope: { attack: 10, decay: 100, sustain: 500, release: 100, amplitude: 1024 },
  },
  7: {
    waveform: 2,
    octave: 3,
    ampEnvelope: { attack: 10, decay: 100, sustain: 500, release: 100, amplitude: 1024 },
  },
  8: {
    waveform: 14,
    octave: 2,
    ampEnvelope: { attack: 5, decay: 70, sustain: 870, release: 50, amplitude: 1024 },
    pitchEnvelope: { attack: 10, decay: 45, sustain: 0, release: 100, amplitude: 20 },
    ampLFO: { frequency: 1, amplitude: 50 },
    pitchLFO: { frequency: 2, amplitude: 1 },
  },
};

// Write 16-bit little-endian integer
function writeUint16LE(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff];
}

// Note: 32-bit function removed - notes length is 16-bit, not 32-bit!
// This was a key finding from the format analysis.

/**
 * Convert BeepBox pattern to MakeCode note events
 * Now passes octave to the conversion function
 */
function convertPatternToNoteEvents(pattern: BeepBoxPattern, octave: number, beepBoxVersion: number, tickScale: number): MakeCodeNoteEvent[] {
  const noteEvents: MakeCodeNoteEvent[] = [];
  
  for (const note of pattern.notes) {
    if (note.pitches.length === 0 || note.points.length < 2) continue;
    
    const startTick = note.points[0].tick * tickScale;
    const endTick = note.points[note.points.length - 1].tick * tickScale;
    
    // Convert all pitches to MakeCode notes using correct formula
    const makeCodeNotes = note.pitches.map(pitch => beepBoxPitchToMakeCodeNoteWithVersion(pitch, octave, beepBoxVersion));
    
    noteEvents.push({
      startTick,
      endTick,
      notes: makeCodeNotes
    });
  }
  
  return noteEvents;
}

// Encode note events to bytes
function encodeNoteEvents(noteEvents: MakeCodeNoteEvent[]): number[] {
  const bytes: number[] = [];
  
  for (const event of noteEvents) {
    // Start tick (16-bit LE)
    bytes.push(...writeUint16LE(event.startTick));
    // End tick (16-bit LE)
    bytes.push(...writeUint16LE(event.endTick));
    // Polyphony (number of notes)
    bytes.push(event.notes.length);
    // Note values (1 byte each)
    bytes.push(...event.notes);
  }
  
  return bytes;
}

/**
 * Convert BeepBox channel to MakeCode track
 * Uses correct octave handling and 16-bit notes length
 */
function convertChannelToTrack(channel: BeepBoxChannel, beepBoxSong: BeepBoxSong, trackId: number): number[] {
  const tickScale = MAKECODE_TICKS_PER_BEAT / beepBoxSong.ticksPerBeat;
  const fallbackOctave = channel.octaveScrollBar || 4;
  const instrumentBytes = getInstrumentBytesForTrack(trackId, fallbackOctave);
  const octave = instrumentBytes[27] ?? fallbackOctave;
  
  // Collect all note events from all patterns in sequence
  const allNoteEvents: MakeCodeNoteEvent[] = [];
  let currentTick = 0;
  const ticksPerBar = beepBoxSong.beatsPerBar * beepBoxSong.ticksPerBeat * tickScale;
  
  for (const patternIndex of channel.sequence) {
    // BeepBox uses 1-based indexing for sequences, convert to 0-based
    const arrayIndex = patternIndex - 1;
    if (arrayIndex < 0 || arrayIndex >= channel.patterns.length) continue;
    
    const pattern = channel.patterns[arrayIndex];
    const patternEvents = convertPatternToNoteEvents(pattern, octave, beepBoxSong.version, tickScale);
    
    // Offset note events by current position in song
    for (const event of patternEvents) {
      allNoteEvents.push({
        startTick: event.startTick + currentTick,
        endTick: event.endTick + currentTick,
        notes: event.notes
      });
    }
    
    currentTick += ticksPerBar;
  }
  
  // If no notes, return empty array
  if (allNoteEvents.length === 0) {
    return [];
  }
  
  const noteEventBytes = encodeNoteEvents(allNoteEvents);
  
  const track: number[] = [];
  
  // Track ID
  track.push(trackId);
  
  // Flags (0 = melodic track, 1 = drum track)
  track.push(0x00);
  
  // Instrument byte length (28 bytes = 0x1c)
  track.push(...writeUint16LE(instrumentBytes.length));
  
  // Instrument data
  track.push(...instrumentBytes);
  
  // CRITICAL: Note events byte length is 16-bit, NOT 32-bit!
  track.push(...writeUint16LE(noteEventBytes.length));
  
  // Note events
  track.push(...noteEventBytes);
  
  return track;
}

// Main conversion function
export function convertBeepBoxToMakeCode(beepBoxSong: BeepBoxSong): string {
  // Build tracks from channels that have notes
  const tracks: number[][] = [];
  let maxEndTick = 0;

  for (let channelIndex = 0; channelIndex < beepBoxSong.channels.length; channelIndex++) {
    const channel = beepBoxSong.channels[channelIndex];
    if (channel.type !== 'pitch') continue;

    const track = convertChannelToTrack(channel, beepBoxSong, channelIndex);
    if (track.length > 0) {
      tracks.push(track);

      const instrumentLen = track[2] | (track[3] << 8);
      const noteLengthOffset = 4 + instrumentLen;
      const noteByteLength = track[noteLengthOffset] | (track[noteLengthOffset + 1] << 8);
      const noteEventsStart = noteLengthOffset + 2;
      const noteEventsEnd = noteEventsStart + noteByteLength;

      let offset = noteEventsStart;
      while (offset < noteEventsEnd) {
        const endTick = track[offset + 2] | (track[offset + 3] << 8);
        if (endTick > maxEndTick) maxEndTick = endTick;
        const polyphony = track[offset + 4];
        offset += 5 + polyphony;
      }
    }
  }
  
  // If no tracks with notes, create a minimal song
  if (tracks.length === 0) {
    throw new Error('No pitch tracks with notes found in BeepBox song');
  }
  
  // Build song header
  const songBytes: number[] = [];
  
  // Version (0)
  songBytes.push(0x00);
  
  // Beats per minute (16-bit LE)
  songBytes.push(...writeUint16LE(beepBoxSong.beatsPerMinute));
  
  songBytes.push(MAKECODE_BEATS_PER_MEASURE);
  songBytes.push(MAKECODE_TICKS_PER_BEAT);

  const ticksPerMeasure = MAKECODE_BEATS_PER_MEASURE * MAKECODE_TICKS_PER_BEAT;
  const computedMeasures = maxEndTick > 0 ? Math.ceil(maxEndTick / ticksPerMeasure) : 1;
  songBytes.push(Math.max(beepBoxSong.loopBars, computedMeasures));
  
  // Number of tracks
  songBytes.push(tracks.length);
  
  // Add all track data
  for (const track of tracks) {
    songBytes.push(...track);
  }
  
  // Convert to hex string
  return songBytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate the full paste.json output
export function generatePasteJSON(beepBoxSong: BeepBoxSong, songName: string = 'convertedSong'): Record<string, unknown> {
  const hexData = convertBeepBoxToMakeCode(beepBoxSong);
  
  return {
    version: 1,
    data: {
      paster: "block",
      blockState: {
        type: "music_song_field_editor",
        id: generateRandomId(),
        x: 146,
        y: 244,
        disabledReasons: [
          "ORPHANED_BLOCK",
          "MANUALLY_DISABLED"
        ],
        data: `{"commentRefs":[],"fieldData":{"song":"mySongs.${songName}"}}`,
        extraState: '<mutation xmlns="http://www.w3.org/1999/xhtml"></mutation>',
        fields: {
          song: {
            version: 1,
            assetType: "song",
            assetId: `mySongs.${songName}`,
            jres: {
              "*": {
                mimeType: "image/x-mkcd-f4",
                dataEncoding: "base64",
                namespace: "myImages"
              },
              [songName]: {
                data: hexData,
                mimeType: "application/mkcd-song",
                displayName: songName,
                namespace: "mySongs."
              }
            }
          }
        }
      },
      typeCounts: {
        music_song_field_editor: 1
      }
    },
    coord: {
      x: 146.30121527777777,
      y: 244.06163194444446
    },
    workspaceId: generateRandomId(),
    targetVersion: "2.0.63",
    headerId: generateRandomId()
  };
}

// Generate a random ID similar to MakeCode format
function generateRandomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Debug function to show note conversions with correct formula
 */
export function debugNoteConversion(beepBoxSong: BeepBoxSong): string {
  const channel = beepBoxSong.channels.find(ch => ch.type === 'pitch');
  if (!channel) return 'No pitch channels found';
  
  const octave = channel.octaveScrollBar || 4;
  
  let output = '=== BeepBox to MakeCode Note Conversion ===\n\n';
  output += `Octave: ${octave}\n`;
  output += `Formula: encodedNote = (beepboxPitch - (${octave} - 2) * 12) + 1\n`;
  output += `Simplified: encodedNote = beepboxPitch - ${(octave - 2) * 12 - 1}\n`;
  output += `Sequence: [${channel.sequence.join(', ')}]\n\n`;
  
  for (const patternIndex of channel.sequence) {
    const arrayIndex = patternIndex - 1;
    if (arrayIndex < 0 || arrayIndex >= channel.patterns.length) continue;
    
    const pattern = channel.patterns[arrayIndex];
    output += `Pattern ${patternIndex} (${pattern.notes.length} notes):\n`;
    
    pattern.notes.forEach((note, idx) => {
      if (note.pitches.length === 0) return;
      
      const makeCodeNotes = note.pitches.map(p => beepBoxPitchToMakeCodeNote(p, octave));
      const hexNotes = makeCodeNotes.map(n => n.toString(16).padStart(2, '0'));
      
      output += `  Note ${idx}: BeepBox [${note.pitches.join(', ')}] -> MakeCode [${makeCodeNotes.join(', ')}] -> Hex [${hexNotes.join(', ')}]\n`;
    });
    
    output += '\n';
  }
  
  return output;
}
