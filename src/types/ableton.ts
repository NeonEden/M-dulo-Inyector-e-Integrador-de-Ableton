export interface MacroControl {
  id: number;
  name: string;
  value: number; // 0.0 to 1.0 or specific units
  defaultValue?: number;
  min?: number;
  max?: number;
  unit?: string;
  targetDevice?: string;
  targetParameter?: string;
  color?: string;
}

export interface DeviceParameter {
  name: string;
  value: number | string | boolean;
  unit?: string;
  mappedMacro?: number;
}

export interface AbletonDevice {
  id: string;
  type: 'Eq8' | 'Compressor2' | 'Saturator' | 'Reverb' | 'Delay' | 'AutoFilter' | 'Utility' | 'Limiter' | 'Vocoder' | 'Chorus2' | 'PhaserNew' | 'Overdrive';
  name: string;
  enabled: boolean;
  parameters: Record<string, number | string | boolean>;
}

export interface ChainBranch {
  id: string;
  name: string;
  color?: string;
  volumeDb: number; // e.g. 0.0, -3.5, -6.0
  pan: number; // -1.0 to 1.0
  muted: boolean;
  solo: boolean;
  devices: AbletonDevice[];
}

export interface MidiMarker {
  timeInBeats: number;
  name: string;
  color?: string;
}

export interface ChordNote {
  note: string; // e.g. "C3", "D#4", "Ab2"
  midiNumber: number; // 60 for C4
}

export interface MidiChordEvent {
  timeInBeats: number;
  durationInBeats: number;
  chordName: string;
  notes: number[]; // MIDI note numbers
  velocity: number;
}

export interface MidiExportOptions {
  rhythmPattern: 'sustained' | 'quarter-stabs' | 'eighth-groove' | 'sixteenth-arp' | 'bassline-root' | 'top-lead';
  humanizeTiming: boolean; // ±10 ticks random offset
  humanizeVelocity: boolean; // ±8 velocity random variation
  baseVelocity: number; // 40-127
  includeMarkers: boolean;
  channel: number; // 0-15 (MIDI Channel 1-16)
  strumSpreadMs?: number; // small delay between chord notes for natural strum
}

export interface ProductionPlan {
  version: string;
  projectName: string;
  genre: string;
  tempo: number;
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  key: string;
  scale: 'Major' | 'Minor' | 'Dorian' | 'Phrygian' | 'Mixolydian' | 'Aeolian';
  rackType: 'AudioEffectRack' | 'InstrumentRack' | 'MidiEffectRack';
  rackName: string;
  description: string;
  macros: MacroControl[];
  chains: ChainBranch[];
  markers: MidiMarker[];
  chords: MidiChordEvent[];
  userLibraryTargetSubfolder?: string;
  exportOptions?: {
    generateAdg: boolean;
    generateAls: boolean;
    generateMid: boolean;
    generatePythonScript: boolean;
  };
}
