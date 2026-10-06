import { MidiChordEvent, MidiMarker, ProductionPlan, MidiExportOptions } from '../types/ableton';

/**
 * Encodes a variable-length quantity for MIDI delta times
 */
function encodeVariableLength(value: number): number[] {
  const bytes: number[] = [];
  let buffer = Math.max(0, Math.floor(value)) & 0x7F;

  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= ((value & 0x7F) | 0x80);
  }

  while (true) {
    bytes.push(buffer & 0xFF);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }

  return bytes;
}

interface TimedNoteEvent {
  tick: number;
  type: 'on' | 'off';
  note: number;
  velocity: number;
}

export const DEFAULT_MIDI_OPTIONS: MidiExportOptions = {
  rhythmPattern: 'sustained',
  humanizeTiming: true,
  humanizeVelocity: true,
  baseVelocity: 92,
  includeMarkers: true,
  channel: 0,
};

/**
 * Generates timed note events based on chord progression and selected rhythm pattern
 */
export function generatePatternNotes(
  chords: MidiChordEvent[],
  ticksPerQuarterNote: number,
  options: MidiExportOptions = DEFAULT_MIDI_OPTIONS
): TimedNoteEvent[] {
  const events: TimedNoteEvent[] = [];
  const baseVel = options.baseVelocity || 92;

  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  chords.forEach((chord, chordIdx) => {
    const startTick = Math.round(chord.timeInBeats * ticksPerQuarterNote);
    const totalDurationTicks = Math.round((chord.durationInBeats || 4) * ticksPerQuarterNote);
    const notes = chord.notes && chord.notes.length > 0 ? chord.notes : [60, 64, 67]; // Fallback C major
    const sortedNotes = [...notes].sort((a, b) => a - b);
    const rootNote = sortedNotes[0];
    const topNote = sortedNotes[sortedNotes.length - 1];

    switch (options.rhythmPattern) {
      case 'quarter-stabs': {
        // 1/4 note stabs (every 1 beat, lasting 0.75 beats)
        const beatsCount = chord.durationInBeats || 4;
        for (let b = 0; b < beatsCount; b++) {
          const beatStart = startTick + Math.round(b * ticksPerQuarterNote);
          const beatDuration = Math.round(ticksPerQuarterNote * 0.75);
          const beatEnd = beatStart + beatDuration;
          const isDownbeat = b === 0 || b === 2;

          sortedNotes.forEach((n, nIdx) => {
            let vel = isDownbeat ? baseVel + 8 : baseVel - 6;
            let timeJitter = 0;
            if (options.humanizeTiming) {
              timeJitter = Math.round((pseudoRandom(beatStart + nIdx * 17) - 0.5) * 16);
            }
            if (options.humanizeVelocity) {
              vel += Math.round((pseudoRandom(beatStart + nIdx * 31) - 0.5) * 12);
            }
            vel = Math.max(20, Math.min(127, vel));

            events.push({
              tick: Math.max(0, beatStart + timeJitter),
              type: 'on',
              note: n,
              velocity: vel,
            });
            events.push({
              tick: Math.max(beatStart + 20, beatEnd + timeJitter),
              type: 'off',
              note: n,
              velocity: 0,
            });
          });
        }
        break;
      }

      case 'eighth-groove': {
        // 1/8 note syncopated groove (8 pulses per 4 beats, with accents)
        const eighthCount = (chord.durationInBeats || 4) * 2;
        const eighthTicks = Math.round(ticksPerQuarterNote * 0.5);

        for (let e = 0; e < eighthCount; e++) {
          // Syncopated rhythm: skip pulse 1 and 5 for a rhythmic bounce (play 0, 2, 3, 4, 6, 7)
          if (e === 1 || e === 5) continue;

          const eStart = startTick + Math.round(e * eighthTicks);
          const eDuration = Math.round(eighthTicks * 0.85);
          const eEnd = eStart + eDuration;
          const isAccent = e === 0 || e === 3 || e === 6;

          sortedNotes.forEach((n, nIdx) => {
            let vel = isAccent ? baseVel + 10 : baseVel - 12;
            let timeJitter = 0;
            if (options.humanizeTiming) {
              timeJitter = Math.round((pseudoRandom(eStart + nIdx * 19) - 0.5) * 14);
            }
            if (options.humanizeVelocity) {
              vel += Math.round((pseudoRandom(eStart + nIdx * 29) - 0.5) * 10);
            }
            vel = Math.max(20, Math.min(127, vel));

            events.push({
              tick: Math.max(0, eStart + timeJitter),
              type: 'on',
              note: n,
              velocity: vel,
            });
            events.push({
              tick: Math.max(eStart + 20, eEnd + timeJitter),
              type: 'off',
              note: n,
              velocity: 0,
            });
          });
        }
        break;
      }

      case 'sixteenth-arp': {
        // 1/16 note arpeggio flowing through chord notes
        const sixteenthCount = (chord.durationInBeats || 4) * 4;
        const sixteenthTicks = Math.round(ticksPerQuarterNote * 0.25);

        for (let s = 0; s < sixteenthCount; s++) {
          const sStart = startTick + Math.round(s * sixteenthTicks);
          const sDuration = Math.round(sixteenthTicks * 0.85);
          const sEnd = sStart + sDuration;
          const noteIndex = s % sortedNotes.length;
          const noteNum = sortedNotes[noteIndex];

          let vel = (s % 4 === 0) ? baseVel + 8 : baseVel - 6;
          let timeJitter = 0;
          if (options.humanizeTiming) {
            timeJitter = Math.round((pseudoRandom(sStart + noteNum) - 0.5) * 12);
          }
          if (options.humanizeVelocity) {
            vel += Math.round((pseudoRandom(sStart + s * 13) - 0.5) * 8);
          }
          vel = Math.max(20, Math.min(127, vel));

          events.push({
            tick: Math.max(0, sStart + timeJitter),
            type: 'on',
            note: noteNum,
            velocity: vel,
          });
          events.push({
            tick: Math.max(sStart + 10, sEnd + timeJitter),
            type: 'off',
            note: noteNum,
            velocity: 0,
          });
        }
        break;
      }

      case 'bassline-root': {
        // Bassline: Root note transposed down 1 or 2 octaves with driving 1/8 note groove
        const bassNote = rootNote > 48 ? rootNote - 24 : rootNote - 12;
        const eighthCount = (chord.durationInBeats || 4) * 2;
        const eighthTicks = Math.round(ticksPerQuarterNote * 0.5);

        for (let b = 0; b < eighthCount; b++) {
          // Offbeat bass or driving bass
          const bStart = startTick + Math.round(b * eighthTicks);
          const bDuration = Math.round(eighthTicks * 0.75);
          const bEnd = bStart + bDuration;
          const isDownbeat = b % 2 === 0;

          let vel = isDownbeat ? baseVel + 12 : baseVel;
          if (options.humanizeVelocity) {
            vel += Math.round((pseudoRandom(bStart + 43) - 0.5) * 8);
          }
          vel = Math.max(20, Math.min(127, vel));

          events.push({
            tick: bStart,
            type: 'on',
            note: bassNote,
            velocity: vel,
          });
          events.push({
            tick: bEnd,
            type: 'off',
            note: bassNote,
            velocity: 0,
          });
        }
        break;
      }

      case 'top-lead': {
        // Top melody note only (useful for lead synth or vocal guides)
        const endTick = startTick + totalDurationTicks - 40;
        let vel = baseVel + 10;
        if (options.humanizeVelocity) {
          vel += Math.round((pseudoRandom(startTick + 71) - 0.5) * 6);
        }
        events.push({
          tick: startTick,
          type: 'on',
          note: topNote,
          velocity: Math.min(127, vel),
        });
        events.push({
          tick: endTick,
          type: 'off',
          note: topNote,
          velocity: 0,
        });
        break;
      }

      case 'sustained':
      default: {
        // Sustained full chord with optional natural strum delay
        const endTick = startTick + totalDurationTicks - 40;
        sortedNotes.forEach((noteNum, nIdx) => {
          const strumOffset = (options.strumSpreadMs || 0) * (nIdx * 2);
          let vel = chord.velocity || baseVel;
          let timeJitter = 0;
          if (options.humanizeTiming) {
            timeJitter = Math.round((pseudoRandom(startTick + nIdx * 23) - 0.5) * 14);
          }
          if (options.humanizeVelocity) {
            vel += Math.round((pseudoRandom(startTick + nIdx * 41) - 0.5) * 10);
          }
          vel = Math.max(20, Math.min(127, vel));

          events.push({
            tick: Math.max(0, startTick + strumOffset + timeJitter),
            type: 'on',
            note: noteNum,
            velocity: vel,
          });
          events.push({
            tick: Math.max(startTick + 20, endTick + strumOffset + timeJitter),
            type: 'off',
            note: noteNum,
            velocity: 0,
          });
        });
        break;
      }
    }
  });

  // Sort events chronologically: Off events before On events if ticks are equal
  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    return a.type === 'off' ? -1 : 1;
  });

  return events;
}

/**
 * Creates a Standard MIDI File (SMF Format 1) binary buffer with rhythm and markers
 */
export function generateMidiFile(
  plan: ProductionPlan,
  options: MidiExportOptions = DEFAULT_MIDI_OPTIONS
): Uint8Array {
  const ticksPerQuarterNote = 480;
  const tempoBpm = plan.tempo || 120;
  const microsecondsPerQuarter = Math.round(60000000 / tempoBpm);
  const midiChannel = Math.max(0, Math.min(15, options.channel || 0));

  // --- Track 1: Conductor Track (Tempo, Time Sig, Section Markers) ---
  const conductorEvents: number[] = [];

  // Delta time 0: Time Signature (4/4, 24 clocks/tick, 8 32nd notes/beat)
  conductorEvents.push(...encodeVariableLength(0));
  conductorEvents.push(0xFF, 0x58, 0x04);
  conductorEvents.push(
    plan.timeSignature?.numerator || 4,
    Math.round(Math.log2(plan.timeSignature?.denominator || 4)),
    24,
    8
  );

  // Delta time 0: Set Tempo
  conductorEvents.push(...encodeVariableLength(0));
  conductorEvents.push(0xFF, 0x51, 0x03);
  conductorEvents.push(
    (microsecondsPerQuarter >> 16) & 0xFF,
    (microsecondsPerQuarter >> 8) & 0xFF,
    microsecondsPerQuarter & 0xFF
  );

  // Section Locators / Markers
  if (options.includeMarkers) {
    const sortedMarkers = [...(plan.markers || [])].sort((a, b) => a.timeInBeats - b.timeInBeats);
    let currentMarkerTick = 0;

    for (const marker of sortedMarkers) {
      const targetTick = Math.round(marker.timeInBeats * ticksPerQuarterNote);
      const deltaTick = Math.max(0, targetTick - currentMarkerTick);
      currentMarkerTick = targetTick;

      // Marker Meta Event (0xFF 0x06 length text)
      const textEncoder = new TextEncoder();
      const markerTextBytes = Array.from(textEncoder.encode(marker.name));
      
      conductorEvents.push(...encodeVariableLength(deltaTick));
      conductorEvents.push(0xFF, 0x06, markerTextBytes.length, ...markerTextBytes);
    }
  }

  // End of Conductor Track
  conductorEvents.push(...encodeVariableLength(ticksPerQuarterNote));
  conductorEvents.push(0xFF, 0x2F, 0x00);

  // --- Track 2: Musical Notes Track ---
  const musicTrackEvents: number[] = [];

  // Track Name
  const patternLabel = options.rhythmPattern.replace(/-/g, ' ').toUpperCase();
  const trackName = `${plan.projectName || 'Chords'} [${plan.key} ${plan.scale}] - ${patternLabel}`;
  const trackNameBytes = Array.from(new TextEncoder().encode(trackName));
  musicTrackEvents.push(...encodeVariableLength(0));
  musicTrackEvents.push(0xFF, 0x03, trackNameBytes.length, ...trackNameBytes);

  // Generate pattern notes
  const timedNotes = generatePatternNotes(plan.chords || [], ticksPerQuarterNote, options);

  let lastTick = 0;
  for (const ev of timedNotes) {
    const delta = Math.max(0, ev.tick - lastTick);
    lastTick = ev.tick;

    musicTrackEvents.push(...encodeVariableLength(delta));
    if (ev.type === 'on') {
      musicTrackEvents.push(0x90 | midiChannel, ev.note & 0x7F, ev.velocity & 0x7F);
    } else {
      musicTrackEvents.push(0x80 | midiChannel, ev.note & 0x7F, 0x00);
    }
  }

  // End of Track 2
  musicTrackEvents.push(...encodeVariableLength(ticksPerQuarterNote));
  musicTrackEvents.push(0xFF, 0x2F, 0x00);

  // Assemble binary MIDI File
  const fileBytes: number[] = [];

  // 1. MThd Header
  fileBytes.push(
    0x4D, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // Header length (6)
    0x00, 0x01,             // Format 1 (multi-track synchronous)
    0x00, 0x02,             // Number of tracks (2)
    (ticksPerQuarterNote >> 8) & 0xFF, ticksPerQuarterNote & 0xFF // Division (480)
  );

  // 2. Track 1 (Conductor)
  fileBytes.push(
    0x4D, 0x54, 0x72, 0x6B, // 'MTrk'
    (conductorEvents.length >> 24) & 0xFF,
    (conductorEvents.length >> 16) & 0xFF,
    (conductorEvents.length >> 8) & 0xFF,
    conductorEvents.length & 0xFF,
    ...conductorEvents
  );

  // 3. Track 2 (Music Notes)
  fileBytes.push(
    0x4D, 0x54, 0x72, 0x6B, // 'MTrk'
    (musicTrackEvents.length >> 24) & 0xFF,
    (musicTrackEvents.length >> 16) & 0xFF,
    (musicTrackEvents.length >> 8) & 0xFF,
    musicTrackEvents.length & 0xFF,
    ...musicTrackEvents
  );

  return new Uint8Array(fileBytes);
}
