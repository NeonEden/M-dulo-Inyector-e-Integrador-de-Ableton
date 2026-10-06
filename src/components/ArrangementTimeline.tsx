import React, { useState } from 'react';
import { ProductionPlan, MidiChordEvent } from '../types/ableton';
import { audioPreview } from '../utils/audioPreview';
import { 
  Music, 
  Clock, 
  MapPin, 
  Play, 
  Square, 
  Volume2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ArrangementTimelineProps {
  plan: ProductionPlan;
  onUpdatePlan: (updatedPlan: ProductionPlan) => void;
}

export const ArrangementTimeline: React.FC<ArrangementTimelineProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const [activePlayingIndex, setActivePlayingIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayProgression = () => {
    if (isPlaying) {
      audioPreview.stop();
      setIsPlaying(false);
      setActivePlayingIndex(-1);
    } else {
      setIsPlaying(true);
      audioPreview.playProgression(plan.chords, plan.tempo, plan, (stepIdx) => {
        setActivePlayingIndex(stepIdx);
        if (stepIdx === -1) setIsPlaying(false);
      });
    }
  };

  const handlePlaySingleChord = (chord: MidiChordEvent, idx: number) => {
    audioPreview.playSingleChord(chord, plan);
    setActivePlayingIndex(idx);
    setTimeout(() => setActivePlayingIndex(-1), 1200);
  };

  const midiNoteToName = (midi: number): string => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    return `${names[midi % 12]}${octave}`;
  };

  // Calculate total beats for timeline width
  const maxBeat = Math.max(
    ...plan.markers.map(m => m.timeInBeats + 32),
    ...plan.chords.map(c => c.timeInBeats + (c.durationInBeats || 8)),
    128
  );

  return (
    <div className="bg-[#18191E] border border-[#2B2E38] rounded-xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B2E38]">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#38EFE6]" />
          <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Arrangement &amp; Harmonic Structure (.mid / .als)
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#121316] px-2.5 py-1 rounded border border-[#2B2E38]">
            <Clock className="w-3 h-3 text-[#EBF764]" />
            <span className="text-slate-400">Tempo:</span>
            <span className="text-slate-100 font-bold">{plan.tempo} BPM</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#121316] px-2.5 py-1 rounded border border-[#2B2E38]">
            <span className="text-slate-400">Key/Scale:</span>
            <span className="text-[#38EFE6] font-bold">{plan.key} {plan.scale}</span>
          </div>

          <button
            onClick={handlePlayProgression}
            className={`px-3 py-1 rounded flex items-center gap-1.5 font-bold transition-all ${
              isPlaying 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                : 'bg-[#38EFE6] hover:bg-[#5cf2ea] text-black shadow'
            }`}
          >
            {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isPlaying ? 'Stop Playback' : 'Play Harmonic Timeline'}</span>
          </button>
        </div>
      </div>

      {/* Markers / Locators Ribbon (Ableton Style) */}
      <div className="mt-4 mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-[#FF764D]" />
          Song Section Markers (Injected as Ableton Locators)
        </span>

        <div className="relative h-9 bg-[#131418] border border-[#262832] rounded-md overflow-x-auto flex items-center px-2">
          {plan.markers.map((marker, idx) => {
            const leftPercent = (marker.timeInBeats / maxBeat) * 100;
            return (
              <div
                key={idx}
                className="absolute flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#20232C] border border-[#38EFE6]/40 text-[#38EFE6] whitespace-nowrap shadow-sm"
                style={{ left: `${Math.min(92, leftPercent)}%` }}
                title={`Bar ${marker.timeInBeats / 4 + 1} (${marker.timeInBeats} Beats)`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF764D]" />
                <span>{marker.name}</span>
                <span className="text-[9px] text-slate-400">[{marker.timeInBeats}b]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chord Progression Piano Roll Blocks */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#EBF764]" />
          Chord Progression &amp; Voice Leading
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {plan.chords.map((chord, idx) => {
            const isPlayingThis = activePlayingIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => handlePlaySingleChord(chord, idx)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isPlayingThis 
                    ? 'bg-[#2A2E3C] border-[#38EFE6] shadow-lg shadow-[#38EFE6]/10 scale-[1.02]' 
                    : 'bg-[#15161B] border-[#262832] hover:border-[#3A3D4C]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-slate-400">#{idx + 1}</span>
                    <span className="text-sm font-bold text-slate-100">{chord.chordName}</span>
                  </div>
                  <button 
                    className="text-slate-400 hover:text-[#38EFE6] p-1 rounded hover:bg-[#20222A]"
                    title="Audition Chord"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Piano Roll Note Visualizer */}
                <div className="space-y-1 bg-[#101115] p-2 rounded border border-[#22242C]">
                  <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>Voicing</span>
                    <span className="text-[#38EFE6]">{chord.durationInBeats} Beats</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {chord.notes.map((n) => (
                      <span
                        key={n}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#222530] text-slate-200 border border-[#323644]"
                      >
                        {midiNoteToName(n)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
