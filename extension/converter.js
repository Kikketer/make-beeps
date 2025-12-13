(() => {
  // src/converter.ts
  function beepBoxPitchToMakeCodeNoteWithVersion(pitch, octave, beepBoxVersion) {
    if (beepBoxVersion >= 9) {
      return pitch - 35;
    }
    const octaveOffset = (octave - 2) * 12;
    return pitch - octaveOffset + 1;
  }
  function createInstrumentBytes(octave = 4) {
    return [
      1,
      // [0] waveform (1 = square wave)
      10,
      0,
      // [1-2] amp attack (10)
      100,
      0,
      // [3-4] amp decay (100)
      244,
      1,
      // [5-6] amp sustain (500)
      100,
      0,
      // [7-8] amp release (100)
      0,
      4,
      // [9-10] amp amp (1024 in little-endian)
      0,
      0,
      // [11-12] pitch attack (0)
      0,
      0,
      // [13-14] pitch decay (0)
      0,
      0,
      // [15-16] pitch sustain (0)
      0,
      0,
      // [17-18] pitch release (0)
      0,
      0,
      // [19-20] pitch amp (0)
      0,
      // [21] amp lfo freq (0)
      0,
      0,
      // [22-23] amp lfo amp (0)
      5,
      // [24] pitch lfo freq (5)
      0,
      0,
      // [25-26] pitch lfo amp (0)
      octave
      // [27] octave (typically 4)
    ];
  }
  var MAKECODE_BEATS_PER_MEASURE = 4;
  var MAKECODE_TICKS_PER_BEAT = 8;
  var MAKECODE_PRESET_INSTRUMENT_BYTES = {
    0: [1, 10, 0, 100, 0, 244, 1, 100, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 4],
    1: [15, 5, 0, 18, 2, 193, 2, 194, 1, 0, 4, 5, 0, 40, 0, 0, 0, 100, 0, 40, 0, 3, 5, 0, 6, 0, 0, 4],
    2: [12, 150, 0, 100, 0, 109, 1, 144, 1, 0, 4, 120, 0, 44, 1, 0, 0, 100, 0, 50, 0, 0, 120, 0, 10, 1, 0, 5]
  };
  function createInstrumentBytesFromMakeCodeParams(params) {
    const out = [];
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
  function getInstrumentBytesForTrack(trackId, fallbackOctave) {
    const preset = MAKECODE_PRESET_INSTRUMENT_BYTES[trackId];
    if (preset) return preset;
    const fallback = MAKECODE_PRESET_INSTRUMENT_PARAMS[trackId];
    if (fallback) return createInstrumentBytesFromMakeCodeParams(fallback);
    return createInstrumentBytes(fallbackOctave);
  }
  var MAKECODE_PRESET_INSTRUMENT_PARAMS = {
    3: {
      waveform: 1,
      octave: 3,
      ampEnvelope: { attack: 220, decay: 105, sustain: 1024, release: 350, amplitude: 1024 },
      ampLFO: { frequency: 5, amplitude: 100 },
      pitchLFO: { frequency: 1, amplitude: 4 }
    },
    4: {
      waveform: 16,
      octave: 4,
      ampEnvelope: { attack: 5, decay: 100, sustain: 1024, release: 30, amplitude: 1024 },
      pitchLFO: { frequency: 10, amplitude: 4 }
    },
    5: {
      waveform: 15,
      octave: 2,
      ampEnvelope: { attack: 10, decay: 100, sustain: 500, release: 10, amplitude: 1024 }
    },
    6: {
      waveform: 1,
      octave: 2,
      ampEnvelope: { attack: 10, decay: 100, sustain: 500, release: 100, amplitude: 1024 }
    },
    7: {
      waveform: 2,
      octave: 3,
      ampEnvelope: { attack: 10, decay: 100, sustain: 500, release: 100, amplitude: 1024 }
    },
    8: {
      waveform: 14,
      octave: 2,
      ampEnvelope: { attack: 5, decay: 70, sustain: 870, release: 50, amplitude: 1024 },
      pitchEnvelope: { attack: 10, decay: 45, sustain: 0, release: 100, amplitude: 20 },
      ampLFO: { frequency: 1, amplitude: 50 },
      pitchLFO: { frequency: 2, amplitude: 1 }
    }
  };
  function writeUint16LE(value) {
    return [value & 255, value >> 8 & 255];
  }
  function convertPatternToNoteEvents(pattern, octave, beepBoxVersion, tickScale) {
    const noteEvents = [];
    for (const note of pattern.notes) {
      if (note.pitches.length === 0 || note.points.length < 2) continue;
      const startTick = note.points[0].tick * tickScale;
      const endTick = note.points[note.points.length - 1].tick * tickScale;
      const makeCodeNotes = note.pitches.map((pitch) => beepBoxPitchToMakeCodeNoteWithVersion(pitch, octave, beepBoxVersion));
      noteEvents.push({
        startTick,
        endTick,
        notes: makeCodeNotes
      });
    }
    return noteEvents;
  }
  function encodeNoteEvents(noteEvents) {
    const bytes = [];
    for (const event of noteEvents) {
      bytes.push(...writeUint16LE(event.startTick));
      bytes.push(...writeUint16LE(event.endTick));
      bytes.push(event.notes.length);
      bytes.push(...event.notes);
    }
    return bytes;
  }
  function convertChannelToTrack(channel, beepBoxSong, trackId) {
    const tickScale = MAKECODE_TICKS_PER_BEAT / beepBoxSong.ticksPerBeat;
    const fallbackOctave = channel.octaveScrollBar || 4;
    const instrumentBytes = getInstrumentBytesForTrack(trackId, fallbackOctave);
    const octave = instrumentBytes[27] ?? fallbackOctave;
    const allNoteEvents = [];
    let currentTick = 0;
    const ticksPerBar = beepBoxSong.beatsPerBar * beepBoxSong.ticksPerBeat * tickScale;
    for (const patternIndex of channel.sequence) {
      const arrayIndex = patternIndex - 1;
      if (arrayIndex < 0 || arrayIndex >= channel.patterns.length) continue;
      const pattern = channel.patterns[arrayIndex];
      const patternEvents = convertPatternToNoteEvents(pattern, octave, beepBoxSong.version, tickScale);
      for (const event of patternEvents) {
        allNoteEvents.push({
          startTick: event.startTick + currentTick,
          endTick: event.endTick + currentTick,
          notes: event.notes
        });
      }
      currentTick += ticksPerBar;
    }
    if (allNoteEvents.length === 0) {
      return [];
    }
    const noteEventBytes = encodeNoteEvents(allNoteEvents);
    const track = [];
    track.push(trackId);
    track.push(0);
    track.push(...writeUint16LE(instrumentBytes.length));
    track.push(...instrumentBytes);
    track.push(...writeUint16LE(noteEventBytes.length));
    track.push(...noteEventBytes);
    return track;
  }
  function convertBeepBoxToMakeCode(beepBoxSong) {
    const tracks = [];
    let maxEndTick = 0;
    for (let channelIndex = 0; channelIndex < beepBoxSong.channels.length; channelIndex++) {
      const channel = beepBoxSong.channels[channelIndex];
      if (channel.type !== "pitch") continue;
      const track = convertChannelToTrack(channel, beepBoxSong, channelIndex);
      if (track.length > 0) {
        tracks.push(track);
        const instrumentLen = track[2] | track[3] << 8;
        const noteLengthOffset = 4 + instrumentLen;
        const noteByteLength = track[noteLengthOffset] | track[noteLengthOffset + 1] << 8;
        const noteEventsStart = noteLengthOffset + 2;
        const noteEventsEnd = noteEventsStart + noteByteLength;
        let offset = noteEventsStart;
        while (offset < noteEventsEnd) {
          const endTick = track[offset + 2] | track[offset + 3] << 8;
          if (endTick > maxEndTick) maxEndTick = endTick;
          const polyphony = track[offset + 4];
          offset += 5 + polyphony;
        }
      }
    }
    if (tracks.length === 0) {
      throw new Error("No pitch tracks with notes found in BeepBox song");
    }
    const songBytes = [];
    songBytes.push(0);
    songBytes.push(...writeUint16LE(beepBoxSong.beatsPerMinute));
    songBytes.push(MAKECODE_BEATS_PER_MEASURE);
    songBytes.push(MAKECODE_TICKS_PER_BEAT);
    const ticksPerMeasure = MAKECODE_BEATS_PER_MEASURE * MAKECODE_TICKS_PER_BEAT;
    const computedMeasures = maxEndTick > 0 ? Math.ceil(maxEndTick / ticksPerMeasure) : 1;
    songBytes.push(Math.max(beepBoxSong.loopBars, computedMeasures));
    songBytes.push(tracks.length);
    for (const track of tracks) {
      songBytes.push(...track);
    }
    return songBytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function generatePasteJSON(beepBoxSong, songName = "convertedSong") {
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
  function generateRandomId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let result = "";
    for (let i = 0; i < 20; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  // extension/converter-entry.ts
  var g = globalThis;
  g.convertBeepBoxToMakeCode = convertBeepBoxToMakeCode;
  g.generatePasteJSON = generatePasteJSON;
})();
//# sourceMappingURL=converter.js.map
