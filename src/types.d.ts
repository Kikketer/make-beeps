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

export interface BeepBoxSong {
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