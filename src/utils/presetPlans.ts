import { ProductionPlan } from '../types/ableton';

export const PRESET_PRODUCTION_PLANS: Record<string, ProductionPlan> = {
  'hyperpop-vocal': {
    version: '1.0.0',
    projectName: 'Hyperpop_Lead_Vocal_Studio',
    genre: 'Hyperpop / Glitchcore / Modern Pop',
    tempo: 152,
    timeSignature: { numerator: 4, denominator: 4 },
    key: 'F#',
    scale: 'Minor',
    rackType: 'AudioEffectRack',
    rackName: 'Hyperpop Vocal Sparkle Rack',
    description: 'Ultra-bright upfront vocal chain with high sparkle, parallel slam compression, tape drive, and ping-pong space delay.',
    userLibraryTargetSubfolder: 'Vocal Racks',
    macros: [
      { id: 1, name: 'Air / Sparkle (12kHz)', value: 0.85, min: 0.0, max: 1.0, color: '#38EFE6' },
      { id: 2, name: 'Vocal Body Slam', value: 0.65, min: 0.0, max: 1.0, color: '#FF764D' },
      { id: 3, name: 'Tape Warmth Drive', value: 0.45, min: 0.0, max: 1.0, color: '#EBF764' },
      { id: 4, name: 'Shimmer Reverb Size', value: 0.38, min: 0.0, max: 1.0, color: '#A78BFA' },
      { id: 5, name: 'Ping-Pong Throw', value: 0.30, min: 0.0, max: 1.0, color: '#34D399' },
      { id: 6, name: 'Stereo Widener', value: 0.70, min: 0.0, max: 1.0, color: '#F472B6' },
      { id: 7, name: 'De-Esser Notch', value: 0.50, min: 0.0, max: 1.0, color: '#94A3B8' },
      { id: 8, name: 'Final Output Trim', value: 0.50, min: 0.0, max: 1.0, color: '#FFFFFF' },
    ],
    chains: [
      {
        id: 'chain-dry',
        name: '01 Direct Crisp Lead',
        volumeDb: 0.0,
        pan: 0.0,
        muted: false,
        solo: false,
        devices: [
          {
            id: 'eq-vocal',
            type: 'Eq8',
            name: 'Vocal Clean & Air EQ',
            enabled: true,
            parameters: { lowCutFreq: 110, midFreq: 2800, midGain: 2.0, highFreq: 12000, highGain: 4.5 }
          },
          {
            id: 'comp-vocal',
            type: 'Compressor2',
            name: 'Optical Vocal Leveler',
            enabled: true,
            parameters: { thresholdDb: -16.0, ratio: 3.5, attackMs: 12, releaseMs: 120, makeupGainDb: 3.0 }
          },
          {
            id: 'util-vocal',
            type: 'Utility',
            name: 'Center Lead Stereo Focus',
            enabled: true,
            parameters: { width: 1.0, gainDb: 0.0, bassMono: true }
          }
        ]
      },
      {
        id: 'chain-parallel-slam',
        name: '02 Parallel NYC Smash',
        volumeDb: -7.5,
        pan: 0.0,
        muted: false,
        solo: false,
        devices: [
          {
            id: 'comp-slam',
            type: 'Compressor2',
            name: 'All-Buttons-In Slammer',
            enabled: true,
            parameters: { thresholdDb: -26.0, ratio: 10.0, attackMs: 2.0, releaseMs: 50.0, makeupGainDb: 6.5 }
          },
          {
            id: 'sat-slam',
            type: 'Saturator',
            name: 'Tube Overdrive Crunch',
            enabled: true,
            parameters: { driveDb: 6.2, outputDb: -2.0, dryWet: 0.85 }
          }
        ]
      },
      {
        id: 'chain-space',
        name: '03 Shimmer Space Reverb',
        volumeDb: -11.0,
        pan: 0.0,
        muted: false,
        solo: false,
        devices: [
          {
            id: 'filter-space',
            type: 'AutoFilter',
            name: 'Pre-Verb High Pass',
            enabled: true,
            parameters: { cutoffFreq: 400, resonance: 0.2 }
          },
          {
            id: 'rev-space',
            type: 'Reverb',
            name: 'Lush Cloud Reverb',
            enabled: true,
            parameters: { decayTimeSec: 4.2, preDelayMs: 35, roomSize: 90, dryWet: 1.0, stereoWidth: 120 }
          }
        ]
      },
      {
        id: 'chain-delay',
        name: '04 Ping-Pong 1/8D Throw',
        volumeDb: -14.0,
        pan: 0.0,
        muted: false,
        solo: false,
        devices: [
          {
            id: 'delay-ping',
            type: 'Delay',
            name: 'Stereo Cross Delay',
            enabled: true,
            parameters: { feedback: 0.55, dryWet: 1.0 }
          }
        ]
      }
    ],
    markers: [
      { timeInBeats: 0, name: 'Intro (8 Bars)', color: '#38EFE6' },
      { timeInBeats: 32, name: 'Verse 1 (8 Bars)', color: '#A78BFA' },
      { timeInBeats: 64, name: 'Pre-Chorus (4 Bars)', color: '#F472B6' },
      { timeInBeats: 80, name: 'Chorus Drop (8 Bars)', color: '#FF764D' },
      { timeInBeats: 112, name: 'Verse 2 (8 Bars)', color: '#A78BFA' },
      { timeInBeats: 144, name: 'Chorus 2 (8 Bars)', color: '#FF764D' },
      { timeInBeats: 176, name: 'Bridge / Glitch (8 Bars)', color: '#EBF764' },
      { timeInBeats: 208, name: 'Final Chorus (16 Bars)', color: '#FF764D' },
      { timeInBeats: 272, name: 'Outro (8 Bars)', color: '#38EFE6' }
    ],
    chords: [
      { timeInBeats: 0, durationInBeats: 8, chordName: 'F#m7', notes: [54, 57, 61, 64, 69], velocity: 92 },
      { timeInBeats: 8, durationInBeats: 8, chordName: 'Dmaj7', notes: [50, 54, 57, 61, 66], velocity: 88 },
      { timeInBeats: 16, durationInBeats: 8, chordName: 'Aadd9', notes: [57, 61, 63, 64, 69], velocity: 94 },
      { timeInBeats: 24, durationInBeats: 8, chordName: 'E7sus4', notes: [52, 57, 59, 62, 67], velocity: 90 },
      { timeInBeats: 32, durationInBeats: 8, chordName: 'F#m7', notes: [54, 57, 61, 64, 69], velocity: 92 },
      { timeInBeats: 40, durationInBeats: 8, chordName: 'Dmaj7', notes: [50, 54, 57, 61, 66], velocity: 88 },
      { timeInBeats: 48, durationInBeats: 8, chordName: 'Aadd9', notes: [57, 61, 63, 64, 69], velocity: 94 },
      { timeInBeats: 56, durationInBeats: 8, chordName: 'C#7', notes: [49, 53, 56, 61, 65], velocity: 95 }
    ]
  },

  'master-bus': {
    version: '1.0.0',
    projectName: 'Master_Loudness_Glue_Session',
    genre: 'Electronic / Bass / Modern EDM',
    tempo: 128,
    timeSignature: { numerator: 4, denominator: 4 },
    key: 'D',
    scale: 'Minor',
    rackType: 'AudioEffectRack',
    rackName: 'Master Glue & Loudness Bus',
    description: 'Precision master chain with SSL-style glue compression, subtle analog tape saturation, mid-side stereo image width, and true-peak limiter.',
    userLibraryTargetSubfolder: 'Mastering Racks',
    macros: [
      { id: 1, name: 'Glue Threshold', value: 0.45, min: 0.0, max: 1.0, color: '#FF764D' },
      { id: 2, name: 'Tape Saturation', value: 0.30, min: 0.0, max: 1.0, color: '#EBF764' },
      { id: 3, name: 'Sub Mono Crossover', value: 0.60, min: 0.0, max: 1.0, color: '#38EFE6' },
      { id: 4, name: 'High-End Air Sheen', value: 0.55, min: 0.0, max: 1.0, color: '#A78BFA' },
      { id: 5, name: 'Stereo Field Expansion', value: 0.65, min: 0.0, max: 1.0, color: '#F472B6' },
      { id: 6, name: 'Limiter Drive (LUFS)', value: 0.50, min: 0.0, max: 1.0, color: '#EF4444' },
      { id: 7, name: 'Ceiling Margin', value: 0.80, min: 0.0, max: 1.0, color: '#94A3B8' },
      { id: 8, name: 'Master Bypass Dry/Wet', value: 1.0, min: 0.0, max: 1.0, color: '#FFFFFF' }
    ],
    chains: [
      {
        id: 'chain-master-main',
        name: 'Master Linear Chain',
        volumeDb: 0.0,
        pan: 0.0,
        muted: false,
        solo: false,
        devices: [
          {
            id: 'eq-master',
            type: 'Eq8',
            name: 'Linear Phase Curve EQ',
            enabled: true,
            parameters: { lowCutFreq: 28, midFreq: 3400, midGain: 0.8, highFreq: 14000, highGain: 1.8 }
          },
          {
            id: 'comp-master',
            type: 'Compressor2',
            name: 'Analog Glue Bus Comp',
            enabled: true,
            parameters: { thresholdDb: -12.0, ratio: 2.0, attackMs: 30.0, releaseMs: 100.0, makeupGainDb: 1.5 }
          },
          {
            id: 'sat-master',
            type: 'Saturator',
            name: 'Warm Tape Head',
            enabled: true,
            parameters: { driveDb: 2.4, outputDb: -0.5, dryWet: 0.6 }
          },
          {
            id: 'util-master',
            type: 'Utility',
            name: 'Sub-Bass Mono & Width',
            enabled: true,
            parameters: { width: 1.15, bassMono: true, gainDb: 0.0 }
          },
          {
            id: 'lim-master',
            type: 'Limiter',
            name: 'True Peak Precision Limiter',
            enabled: true,
            parameters: { gainDb: 2.8, ceilingDb: -0.3 }
          }
        ]
      }
    ],
    markers: [
      { timeInBeats: 0, name: 'Intro', color: '#38EFE6' },
      { timeInBeats: 32, name: 'Buildup', color: '#EBF764' },
      { timeInBeats: 64, name: 'Main Drop', color: '#FF764D' },
      { timeInBeats: 128, name: 'Breakdown', color: '#A78BFA' },
      { timeInBeats: 160, name: 'Second Drop', color: '#FF764D' },
      { timeInBeats: 224, name: 'Outro', color: '#38EFE6' }
    ],
    chords: [
      { timeInBeats: 0, durationInBeats: 8, chordName: 'Dm9', notes: [50, 53, 57, 60, 64], velocity: 95 },
      { timeInBeats: 8, durationInBeats: 8, chordName: 'Bbmaj7', notes: [46, 50, 53, 57, 62], velocity: 95 },
      { timeInBeats: 16, durationInBeats: 8, chordName: 'Gm7', notes: [43, 46, 50, 53, 58], velocity: 95 },
      { timeInBeats: 24, durationInBeats: 8, chordName: 'A7(b9)', notes: [45, 49, 52, 55, 58], velocity: 95 }
    ]
  },

  'trap-vocal-adlib': {
    version: '1.0.0',
    projectName: 'Modern_Trap_AdLib_Engine',
    genre: 'Trap / Hip-Hop / Drill',
    tempo: 144,
    timeSignature: { numerator: 4, denominator: 4 },
    key: 'C',
    scale: 'Minor',
    rackType: 'AudioEffectRack',
    rackName: 'Trap Ad-Lib Telephone & Space Rack',
    description: 'Specialized vocal and ad-lib processor with filtered telephone bandpass, distortion crunch, double slap delay, and huge drop reverb.',
    userLibraryTargetSubfolder: 'Vocal Racks',
    macros: [
      { id: 1, name: 'Telephone Filter Mix', value: 0.50, min: 0.0, max: 1.0, color: '#EBF764' },
      { id: 2, name: 'Distortion Bite', value: 0.60, min: 0.0, max: 1.0, color: '#FF764D' },
      { id: 3, name: 'Slapback Delay', value: 0.40, min: 0.0, max: 1.0, color: '#38EFE6' },
      { id: 4, name: 'Abyss Reverb Fill', value: 0.45, min: 0.0, max: 1.0, color: '#A78BFA' }
    ],
    chains: [
      {
        id: 'chain-trap-lead',
        name: 'Dry Ad-Lib Track',
        volumeDb: 0.0,
        pan: 0.0,
        muted: false,
        solo: false,
        devices: [
          {
            id: 'eq-trap',
            type: 'Eq8',
            name: 'Low Cut & Clarity',
            enabled: true,
            parameters: { lowCutFreq: 140, midFreq: 3200, midGain: 3.0, highFreq: 10000, highGain: 2.0 }
          }
        ]
      },
      {
        id: 'chain-trap-phone',
        name: 'Telephone FX Bandpass',
        volumeDb: -4.0,
        pan: 0.35,
        muted: false,
        solo: false,
        devices: [
          {
            id: 'filter-phone',
            type: 'AutoFilter',
            name: 'Bandpass Telephone',
            enabled: true,
            parameters: { cutoffFreq: 1800, resonance: 0.5, filterType: 2 }
          },
          {
            id: 'sat-phone',
            type: 'Saturator',
            name: 'Gritty Distortion',
            enabled: true,
            parameters: { driveDb: 8.5, outputDb: -3.0 }
          }
        ]
      }
    ],
    markers: [
      { timeInBeats: 0, name: 'Intro', color: '#38EFE6' },
      { timeInBeats: 16, name: 'Hook / Chorus', color: '#FF764D' },
      { timeInBeats: 48, name: 'Verse 1', color: '#A78BFA' },
      { timeInBeats: 80, name: 'Hook / Chorus', color: '#FF764D' },
      { timeInBeats: 112, name: 'Verse 2', color: '#A78BFA' },
      { timeInBeats: 144, name: 'Outro', color: '#38EFE6' }
    ],
    chords: [
      { timeInBeats: 0, durationInBeats: 8, chordName: 'Cm', notes: [48, 51, 55, 60], velocity: 90 },
      { timeInBeats: 8, durationInBeats: 8, chordName: 'Ab', notes: [44, 48, 51, 56], velocity: 90 },
      { timeInBeats: 16, durationInBeats: 8, chordName: 'Fm', notes: [41, 44, 48, 53], velocity: 90 },
      { timeInBeats: 24, durationInBeats: 8, chordName: 'G7', notes: [43, 47, 50, 53], velocity: 95 }
    ]
  }
};
