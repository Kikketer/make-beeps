// BeepBox to MakeCode Arcade converter
// Standalone version for Chrome extension

/**
 * Convert BeepBox pitch to MakeCode note value
 * 
 * Formula discovered from analysis:
 * encodedNote = (beepboxPitch - (octave - 2) * 12) + 1
 */
function beepBoxPitchToMakeCodeNote(pitch, octave) {
  const octaveOffset = (octave - 2) * 12;
  return (pitch - octaveOffset) + 1;
}

/**
 * Create instrument bytes (28 bytes)
 * Exact bytes from working MakeCode examples
 */
function createInstrumentBytes(octave = 4) {
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
function writeUint16LE(value) {
  return [value & 0xff, (value >> 8) & 0xff];
}

/**
 * Convert BeepBox pattern to MakeCode note events
 */
function convertPatternToNoteEvents(pattern, octave) {
  const noteEvents = [];
  
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
function encodeNoteEvents(noteEvents) {
  const bytes = [];
  
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
 */
function convertChannelToTrack(channel, beepBoxSong, trackId) {
  // MakeCode typically uses octave 4, but we can use BeepBox's octaveScrollBar
  const octave = channel.octaveScrollBar || 4;
  
  // Collect all note events from all patterns in sequence
  const allNoteEvents = [];
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
  
  const track = [];
  
  // Track ID
  track.push(trackId);
  
  // Flags (0 = melodic track, 1 = drum track)
  track.push(0x00);
  
  // Instrument byte length (28 bytes = 0x1c)
  track.push(...writeUint16LE(instrumentBytes.length));
  
  // Instrument data
  track.push(...instrumentBytes);
  
  // Note events byte length (16-bit)
  track.push(...writeUint16LE(noteEventBytes.length));
  
  // Note events
  track.push(...noteEventBytes);
  
  return track;
}

// Main conversion function
function convertBeepBoxToMakeCode(beepBoxSong) {
  // Build tracks from channels that have notes
  const tracks = [];
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
  const songBytes = [];
  
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
function generatePasteJSON(beepBoxSong, songName = 'convertedSong') {
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
function generateRandomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { convertBeepBoxToMakeCode, generatePasteJSON };
}
