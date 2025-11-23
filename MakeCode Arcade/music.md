/**
* Byte encoding format for songs
* FIXME: should this all be word aligned?
*
* song(7 + length of all tracks bytes)
*     0 version
*     1 beats per minute
*     3 beats per measure
*     4 ticks per beat
*     5 measures
*     6 number of tracks
*     ...tracks
*
* track(6 + instrument length + note length bytes)
*     0 id
*     1 flags
*     2 instruments byte length
*     4...instrument
*     notes byte length
*     ...note events
*
* instrument(28 bytes)
*     0 waveform
*     1 amp attack
*     3 amp decay
*     5 amp sustain
*     7 amp release
*     9 amp amp
*     11 pitch attack
*     13 pitch decay
*     15 pitch sustain
*     17 pitch release
*     19 pitch amp
*     21 amp lfo freq
*     22 amp lfo amp
*     24 pitch lfo freq
*     25 pitch lfo amp
*     27 octave
*
* drum(5 + 7 * steps bytes)
*     0 steps
*     1 start freq
*     3 start amp
*     5...steps
*
* drum step(7 bytes)
*     0 waveform
*     1 freq
*     3 volume
*     5 duration
*
* note event(5 + 1 * polyphony bytes)
*     0 start tick
*     2 end tick
*     4 polyphony
*     5...notes(1 byte each)
*
* note (1 byte)
*     lower six bits = note - (instrumentOctave - 2) * 12
*     upper two bits are the enharmonic spelling:
*          0 = normal
*          1 = flat
*          2 = sharp
*/

example tune with one C note:
0078000408020100001c00010a006400f4016400000400000000000000000000000000050000040600000004000124

## Breakdown (parsed right to left):

| Section | Bytes (hex) | Decimal | Description | Position |
|---------|-------------|---------|-------------|----------|
| **Note Event - Note** | 24 | 36 | Note value (C note) | Byte 48 |
| **Note Event - Polyphony** | 01 | 1 | Number of notes | Byte 47 |
| **Note Event - End Tick** | 0004 | 4 | When note ends | Bytes 45-46 |
| **Note Event - Start Tick** | 0000 | 0 | When note starts | Bytes 43-44 |
| **Track - Notes Length** | 06000000 | 6 | Length of note events section | Bytes 39-42 |
| **Track - Instrument Length** | 0400 | 4 | Should be 1C00 (28 bytes)? | Bytes 37-38 |
| **Instrument - Octave** | 05 | 5 | Octave setting | Byte 36 |
| **Instrument - Pitch LFO Amp** | 00 | 0 | Pitch LFO amplitude | Byte 35 |
| **Instrument - Pitch LFO Freq** | 00 | 0 | Pitch LFO frequency | Byte 34 |
| **Instrument - Amp LFO Amp** | 00 | 0 | Amp LFO amplitude | Byte 33 |
| **Instrument - Amp LFO Freq** | 00 | 0 | Amp LFO frequency | Byte 32 |
| **Instrument - Pitch Amp** | 0000 | 0 | Pitch envelope amp | Bytes 30-31 |
| **Instrument - Pitch Release** | 0000 | 0 | Pitch release | Bytes 28-29 |
| **Instrument - Pitch Sustain** | 0000 | 0 | Pitch sustain | Bytes 26-27 |
| **Instrument - Pitch Decay** | 0000 | 0 | Pitch decay | Bytes 24-25 |
| **Instrument - Pitch Attack** | 0000 | 0 | Pitch attack | Bytes 22-23 |
| **Instrument - Amp Amp** | 6401 | 356 | Amp envelope amp | Bytes 20-21 |
| **Instrument - Amp Release** | f401 | 500 | Amp release | Bytes 18-19 |
| **Instrument - Amp Sustain** | 6400 | 100 | Amp sustain | Bytes 16-17 |
| **Instrument - Amp Decay** | 0a00 | 10 | Amp decay | Bytes 14-15 |
| **Instrument - Amp Attack** | 0100 | 1 | Amp attack | Bytes 12-13 |
| **Track - Instrument Byte Length** | 1c00 | 28 | Length of instrument (correct) | Bytes 10-11 |
| **Track - Flags** | 01 | 1 | Track flags | Byte 9 |
| **Track - ID** | 00 | 0 | Track identifier | Byte 8 |
| **Song - Number of Tracks** | 02 | 2 | Wait, should be 1? | Byte 7 |
| **Song - Measures** | 08 | 8 | Number of measures | Byte 6 |
| **Song - Ticks per Beat** | 04 | 4 | Ticks per beat | Byte 5 |
| **Song - Beats per Measure** | 00 | 0 | Beats per measure | Byte 4 |
| **Song - Beats per Minute** | 7800 | 120 | Tempo (BPM) | Bytes 2-3 |
| **Song - Version** | 00 | 0 | Format version | Byte 1 |

**Note:** The last 3 hex digits (124) = the note byte (24 in hex = 36 decimal) which represents a C note.

example of a B note:
0078000408020100001c00010a006400f4016400000400000000000000000000000000050000040600000004000122