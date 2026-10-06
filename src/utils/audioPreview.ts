import { MidiChordEvent, ProductionPlan } from '../types/ableton';

class AudioPreviewEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private activeNodes: { stop: () => void }[] = [];

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private midiToFreq(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  public playSingleChord(chord: MidiChordEvent, plan?: ProductionPlan) {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const duration = 1.6;

    // Master bus
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Apply basic filter/saturation from plan if present
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoffMacro = plan?.macros.find(m => m.name.toLowerCase().includes('sparkle') || m.name.toLowerCase().includes('air'));
    filter.frequency.setValueAtTime(cutoffMacro ? 1200 + cutoffMacro.value * 7000 : 3500, now);

    // Subtle stereo delay / space
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.22;
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.28;

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    filter.connect(delay);
    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayFeedback.connect(ctx.destination);

    // Oscillators for each note in chord
    chord.notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(this.midiToFreq(note), now);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  public playProgression(chords: MidiChordEvent[], tempoBpm: number = 120, plan?: ProductionPlan, onStep?: (index: number) => void) {
    if (this.isPlaying) {
      this.stop();
      return;
    }

    const ctx = this.getContext();
    this.isPlaying = true;
    const beatDurationSec = 60 / tempoBpm;

    let totalOffset = 0;
    chords.forEach((chord, idx) => {
      const startTime = ctx.currentTime + totalOffset;
      const chordDuration = (chord.durationInBeats || 4) * beatDurationSec;

      const timer = setTimeout(() => {
        if (!this.isPlaying) return;
        this.playSingleChord(chord, plan);
        if (onStep) onStep(idx);
      }, totalOffset * 1000);

      this.activeNodes.push({
        stop: () => clearTimeout(timer)
      });

      totalOffset += chordDuration;
    });

    const finishTimer = setTimeout(() => {
      this.isPlaying = false;
      if (onStep) onStep(-1);
    }, totalOffset * 1000);

    this.activeNodes.push({
      stop: () => clearTimeout(finishTimer)
    });
  }

  public stop() {
    this.isPlaying = false;
    this.activeNodes.forEach(n => n.stop());
    this.activeNodes = [];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioPreview = new AudioPreviewEngine();
