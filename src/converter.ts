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
function convertPatternToNoteEvents(pattern: BeepBoxPattern, octave: number): MakeCodeNoteEvent[] {
  const noteEvents: MakeCodeNoteEvent[] = [];
  
  for (const note of pattern.notes) {
    if (note.pitches.length === 0 || note.points.length < 2) continue;
    
    const startTick = note.points[0].tick;
    const endTick = note.points[note.points.length - 1].tick;
    
    // Convert all pitches to MakeCode notes using correct formula
    const makeCodeNotes = note.pitches.map(pitch => beepBoxPitchToMakeCodeNote(pitch, octave));
    
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
  // MakeCode typically uses octave 4, but we can use BeepBox's octaveScrollBar
  const octave = channel.octaveScrollBar || 4;
  
  // Collect all note events from all patterns in sequence
  const allNoteEvents: MakeCodeNoteEvent[] = [];
  let currentTick = 0;
  const ticksPerBar = beepBoxSong.beatsPerBar * beepBoxSong.ticksPerBeat;
  
  for (const patternIndex of channel.sequence) {
    // BeepBox uses 1-based indexing for sequences, convert to 0-based
    const arrayIndex = patternIndex - 1;
    if (arrayIndex < 0 || arrayIndex >= channel.patterns.length) continue;
    
    const pattern = channel.patterns[arrayIndex];
    const patternEvents = convertPatternToNoteEvents(pattern, octave);
    
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
  
  const instrumentBytes = createInstrumentBytes(octave);
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
  let trackId = 0;
  
  for (const channel of beepBoxSong.channels) {
    if (channel.type !== 'pitch') continue; // Skip drum tracks for now
    
    const track = convertChannelToTrack(channel, beepBoxSong, trackId);
    if (track.length > 0) {
      tracks.push(track);
      trackId++;
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
  
  // Beats per measure
  songBytes.push(beepBoxSong.beatsPerBar);
  
  // Ticks per beat
  songBytes.push(beepBoxSong.ticksPerBeat);
  
  // Measures - use loopBars directly
  songBytes.push(beepBoxSong.loopBars);
  
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
    targetVersion: "2.0.62",
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
