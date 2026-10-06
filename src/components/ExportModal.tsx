import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import { ProductionPlan, MidiExportOptions } from '../types/ableton';
import { 
  generateAbletonRackXml, 
  generateAbletonProjectXml, 
  compressToAbletonBinary 
} from '../utils/abletonXmlGenerator';
import { generateMidiFile, generatePatternNotes, DEFAULT_MIDI_OPTIONS } from '../utils/midiGenerator';
import { generatePythonScriptCode } from '../utils/pythonScriptGenerator';
import { audioPreview } from '../utils/audioPreview';
import { 
  Download, 
  Package, 
  FileCode, 
  Music, 
  Layers, 
  Check, 
  Sparkles, 
  ArrowDownToLine,
  FolderCheck,
  Sliders,
  Play,
  Square,
  Activity,
  Zap,
  Volume2
} from 'lucide-react';

interface ExportModalProps {
  plan: ProductionPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({ plan }) => {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);
  
  // Custom MIDI Exporter Options
  const [midiOptions, setMidiOptions] = useState<MidiExportOptions>(DEFAULT_MIDI_OPTIONS);
  const [customMidiFilename, setCustomMidiFilename] = useState<string>(
    `${plan.projectName || 'Chords'}_Harmonic_Structure`
  );
  const [isPlayingMidiPreview, setIsPlayingMidiPreview] = useState(false);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAdg = () => {
    const xml = generateAbletonRackXml(plan);
    const gzipped = compressToAbletonBinary(xml);
    const blob = new Blob([gzipped as unknown as BlobPart], { type: 'application/octet-stream' });
    const filename = `${plan.rackName.replace(/\s+/g, '_') || 'Audio_Rack'}.adg`;
    triggerDownload(blob, filename);
    setDownloadedItem('adg');
    setTimeout(() => setDownloadedItem(null), 2500);
  };

  const handleDownloadAls = () => {
    const xml = generateAbletonProjectXml(plan);
    const gzipped = compressToAbletonBinary(xml);
    const blob = new Blob([gzipped as unknown as BlobPart], { type: 'application/octet-stream' });
    const filename = `${plan.projectName.replace(/\s+/g, '_') || 'Ableton_Project'}_Template.als`;
    triggerDownload(blob, filename);
    setDownloadedItem('als');
    setTimeout(() => setDownloadedItem(null), 2500);
  };

  // Custom MIDI File Exporter using configured options
  const handleDownloadCustomMid = (optionsOverride?: Partial<MidiExportOptions>, nameSuffix?: string) => {
    const opts = { ...midiOptions, ...optionsOverride };
    const midiBytes = generateMidiFile(plan, opts);
    const blob = new Blob([midiBytes as unknown as BlobPart], { type: 'audio/midi' });
    const suffix = nameSuffix || `_${opts.rhythmPattern}`;
    const filename = `${(customMidiFilename || 'MIDI_Export').replace(/\s+/g, '_')}${suffix}.mid`;
    triggerDownload(blob, filename);
    setDownloadedItem('mid');
    setTimeout(() => setDownloadedItem(null), 2500);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(plan, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerDownload(blob, 'production_plan.json');
    setDownloadedItem('json');
    setTimeout(() => setDownloadedItem(null), 2500);
  };

  const handleDownloadPython = () => {
    const pyCode = generatePythonScriptCode(plan);
    const blob = new Blob([pyCode], { type: 'text/x-python' });
    triggerDownload(blob, 'ableton_builder.py');
    setDownloadedItem('py');
    setTimeout(() => setDownloadedItem(null), 2500);
  };

  const handleDownloadFullZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();

      // 1. .adg rack
      const rackXml = generateAbletonRackXml(plan);
      const rackGzip = compressToAbletonBinary(rackXml);
      const rackFilename = `${plan.rackName.replace(/\s+/g, '_') || 'Audio_Rack'}.adg`;
      zip.file(`Presets/${rackFilename}`, rackGzip);

      // 2. .als project
      const alsXml = generateAbletonProjectXml(plan);
      const alsGzip = compressToAbletonBinary(alsXml);
      const alsFilename = `${plan.projectName.replace(/\s+/g, '_') || 'Project'}_Template.als`;
      zip.file(`Projects/${alsFilename}`, alsGzip);

      // 3. MIDI Variations Folder
      const rhythmPatterns: Array<MidiExportOptions['rhythmPattern']> = [
        'sustained',
        'quarter-stabs',
        'eighth-groove',
        'sixteenth-arp',
        'bassline-root',
        'top-lead',
      ];

      rhythmPatterns.forEach((pat) => {
        const bytes = generateMidiFile(plan, { ...midiOptions, rhythmPattern: pat });
        zip.file(`MIDI/${plan.projectName || 'Chords'}_${pat}.mid`, bytes);
      });

      // 4. production_plan.json
      zip.file('production_plan.json', JSON.stringify(plan, null, 2));

      // 5. ableton_builder.py
      zip.file('ableton_builder.py', generatePythonScriptCode(plan));

      // 6. README.txt
      const readmeText = `Ableton Live Production Pack: ${plan.projectName}
Generated by Ableton Builder & Injector Studio

CONTENTS:
- Presets/${rackFilename} -> Drop into your Ableton Live track or copy to User Library/Presets/Audio Effects/Audio Effect Rack
- Projects/${alsFilename} -> Double-click to open complete Live Set with pre-routed racks and markers
- MIDI/ -> Standard MIDI (.mid) files in 6 rhythm variations:
    1. sustained.mid (Full pads / sustained harmony)
    2. quarter-stabs.mid (House / Pop piano 1/4 stabs)
    3. eighth-groove.mid (Syncopated 1/8 bounce)
    4. sixteenth-arp.mid (Melodic 1/16 arpeggio)
    5. bassline-root.mid (Sub / Bassline root groove)
    6. top-lead.mid (Top melody voice)
- production_plan.json -> Standard JSON configuration plan
- ableton_builder.py -> Standalone Python script to build and inject racks automatically:
    python ableton_builder.py --input production_plan.json --target-library

Genre: ${plan.genre}
Tempo: ${plan.tempo} BPM
Key:   ${plan.key} ${plan.scale}
`;
      zip.file('README.txt', readmeText);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(zipBlob, `${plan.projectName.replace(/\s+/g, '_')}_Ableton_Pack.zip`);
      setDownloadedItem('zip');
      setTimeout(() => setDownloadedItem(null), 3000);
    } catch (err) {
      console.error('Error creating ZIP bundle:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  // Calculate pattern preview notes for visual inspection
  const patternPreviewEvents = useMemo(() => {
    return generatePatternNotes(plan.chords, 480, midiOptions);
  }, [plan.chords, midiOptions]);

  const handleAuditionPattern = () => {
    if (isPlayingMidiPreview) {
      audioPreview.stop();
      setIsPlayingMidiPreview(false);
    } else {
      setIsPlayingMidiPreview(true);
      audioPreview.playProgression(plan.chords, plan.tempo, plan, (stepIdx) => {
        if (stepIdx === -1) setIsPlayingMidiPreview(false);
      });
    }
  };

  return (
    <div className="bg-[#18191E] border border-[#2B2E38] rounded-xl p-4 sm:p-5 shadow-xl space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#2B2E38]">
        <div className="flex items-center gap-2">
          <ArrowDownToLine className="w-5 h-5 text-[#38EFE6]" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Direct Ableton Live Exporter (.adg / .als / .mid / .zip)
            </h3>
            <p className="text-xs text-slate-400">
              Generate native Gzip-compressed racks, Live Set project templates, and structured MIDI grooves.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadFullZip}
          disabled={downloadingZip}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-[#FF764D] to-[#EBF764] hover:opacity-95 text-black flex items-center gap-2 shadow-lg transition-all"
        >
          {downloadingZip ? (
            <span>Packing ZIP Archive...</span>
          ) : downloadedItem === 'zip' ? (
            <>
              <Check className="w-4 h-4" />
              <span>Downloaded Full Pack!</span>
            </>
          ) : (
            <>
              <Package className="w-4 h-4" />
              <span>Download All-in-One Pack (.zip)</span>
            </>
          )}
        </button>
      </div>

      {/* DEDICATED MIDI EXPORTER ENGINE */}
      <div className="p-4 bg-[#141519] border border-[#2A2E3B] rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#252834]">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-[#A78BFA]" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              MIDI Exporter &amp; Harmonic Groove Engine (.mid)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Key: <b className="text-[#38EFE6]">{plan.key} {plan.scale}</b></span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Tempo: <b className="text-[#EBF764]">{plan.tempo} BPM</b></span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Notes: <b className="text-emerald-400">{patternPreviewEvents.filter(e => e.type === 'on').length} Events</b></span>
          </div>
        </div>

        {/* 1. Rhythm Pattern Selector */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Rhythm &amp; Groove Pattern
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'sustained', label: 'Sustained Pads', desc: 'Full-length harmony block voicings', icon: '🎹' },
              { id: 'quarter-stabs', label: '1/4 Stabs', desc: 'Punchy 4/4 house & pop piano stabs', icon: '⚡' },
              { id: 'eighth-groove', label: '1/8 Groove', desc: 'Syncopated trap & bouncy rhythm', icon: '🎛️' },
              { id: 'sixteenth-arp', label: '1/16 Arpeggio', desc: 'Ascending fast pluck sequence', icon: '✨' },
              { id: 'bassline-root', label: 'Bassline Root', desc: 'Sub-octave driving root rhythm', icon: '🎸' },
              { id: 'top-lead', label: 'Top Melody Lead', desc: 'Highest vocal / synth voice line', icon: '🎤' },
            ].map((pat) => (
              <button
                key={pat.id}
                onClick={() => setMidiOptions({ ...midiOptions, rhythmPattern: pat.id as MidiExportOptions['rhythmPattern'] })}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  midiOptions.rhythmPattern === pat.id
                    ? 'bg-[#232736] border-[#A78BFA] shadow-md shadow-[#A78BFA]/10'
                    : 'bg-[#181920] border-[#252834] hover:border-[#353949]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{pat.icon}</span>
                  <span className="text-xs font-bold text-slate-200">{pat.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {pat.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. MIDI Nuances & Humanize Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#181A22] p-3 rounded-lg border border-[#252834]">
          {/* Base Velocity */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span>Base Velocity</span>
              <span className="text-[#A78BFA] font-bold">{midiOptions.baseVelocity} / 127</span>
            </div>
            <input
              type="range"
              min="40"
              max="127"
              value={midiOptions.baseVelocity}
              onChange={(e) => setMidiOptions({ ...midiOptions, baseVelocity: parseInt(e.target.value) })}
              className="w-full accent-[#A78BFA] h-1 bg-[#101115] rounded cursor-pointer"
            />
          </div>

          {/* Timing Humanize */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="humanizeTiming"
              checked={midiOptions.humanizeTiming}
              onChange={(e) => setMidiOptions({ ...midiOptions, humanizeTiming: e.target.checked })}
              className="w-4 h-4 accent-[#38EFE6] rounded cursor-pointer"
            />
            <label htmlFor="humanizeTiming" className="text-xs text-slate-300 cursor-pointer">
              <span className="font-semibold block">Humanize Timing</span>
              <span className="text-[10px] text-slate-400">Natural clock micro-jitter (±12 ticks)</span>
            </label>
          </div>

          {/* Velocity Humanize */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="humanizeVelocity"
              checked={midiOptions.humanizeVelocity}
              onChange={(e) => setMidiOptions({ ...midiOptions, humanizeVelocity: e.target.checked })}
              className="w-4 h-4 accent-[#EBF764] rounded cursor-pointer"
            />
            <label htmlFor="humanizeVelocity" className="text-xs text-slate-300 cursor-pointer">
              <span className="font-semibold block">Humanize Dynamics</span>
              <span className="text-[10px] text-slate-400">Organic strike velocity variation</span>
            </label>
          </div>

          {/* Include Song Markers */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeMarkers"
              checked={midiOptions.includeMarkers}
              onChange={(e) => setMidiOptions({ ...midiOptions, includeMarkers: e.target.checked })}
              className="w-4 h-4 accent-[#FF764D] rounded cursor-pointer"
            />
            <label htmlFor="includeMarkers" className="text-xs text-slate-300 cursor-pointer">
              <span className="font-semibold block">Include Cue Markers</span>
              <span className="text-[10px] text-slate-400">Embed Intro, Verse, Chorus cues</span>
            </label>
          </div>
        </div>

        {/* 3. Export Action Bar for MIDI */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-[11px] font-mono text-slate-400 shrink-0">Filename:</label>
            <input
              type="text"
              value={customMidiFilename}
              onChange={(e) => setCustomMidiFilename(e.target.value)}
              className="bg-[#111216] border border-[#2B2E38] rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:border-[#A78BFA] focus:outline-none w-full sm:w-64"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleAuditionPattern}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                isPlayingMidiPreview 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
                  : 'bg-[#20222A] hover:bg-[#282B36] text-slate-200 border border-[#2B2E38]'
              }`}
            >
              {isPlayingMidiPreview ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current text-[#A78BFA]" />}
              <span>{isPlayingMidiPreview ? 'Stop' : 'Audition Pattern'}</span>
            </button>

            <button
              onClick={() => handleDownloadCustomMid()}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#A78BFA] hover:bg-[#b89efa] text-black flex items-center gap-1.5 shadow"
            >
              {downloadedItem === 'mid' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>MIDI Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export MIDI (.mid)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Individual File Quick Exporters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. ADG Rack */}
        <div className="p-3.5 bg-[#131418] border border-[#262832] hover:border-[#38EFE6]/50 rounded-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#38EFE6]">.adg Audio Effect Rack</span>
              <Layers className="w-4 h-4 text-[#38EFE6]" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mb-3">
              Gzip-compressed Ableton rack device with 16 mapped macros, parallel chains, and active DSP devices.
            </p>
          </div>
          <button
            onClick={handleDownloadAdg}
            className="w-full py-1.5 px-2.5 rounded bg-[#20222A] hover:bg-[#282B36] border border-[#2B2E38] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            {downloadedItem === 'adg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#38EFE6]" />}
            <span>{downloadedItem === 'adg' ? 'Downloaded' : 'Download .adg'}</span>
          </button>
        </div>

        {/* 2. ALS Project */}
        <div className="p-3.5 bg-[#131418] border border-[#262832] hover:border-[#EBF764]/50 rounded-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#EBF764]">.als Live Set Template</span>
              <FolderCheck className="w-4 h-4 text-[#EBF764]" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mb-3">
              Complete project session file with tempo automation, locators/markers, and pre-routed audio tracks.
            </p>
          </div>
          <button
            onClick={handleDownloadAls}
            className="w-full py-1.5 px-2.5 rounded bg-[#20222A] hover:bg-[#282B36] border border-[#2B2E38] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            {downloadedItem === 'als' ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#EBF764]" />}
            <span>{downloadedItem === 'als' ? 'Downloaded' : 'Download .als'}</span>
          </button>
        </div>

        {/* 3. MID File */}
        <div className="p-3.5 bg-[#131418] border border-[#262832] hover:border-[#A78BFA]/50 rounded-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#A78BFA]">.mid Quick Groove</span>
              <Music className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mb-3">
              Standard Type 1 binary MIDI with section locators (Intro, Verse, Drop) and harmonic voice-leading chords.
            </p>
          </div>
          <button
            onClick={() => handleDownloadCustomMid({ rhythmPattern: 'sustained' }, '_quick')}
            className="w-full py-1.5 px-2.5 rounded bg-[#20222A] hover:bg-[#282B36] border border-[#2B2E38] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            {downloadedItem === 'mid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#A78BFA]" />}
            <span>{downloadedItem === 'mid' ? 'Downloaded' : 'Download .mid'}</span>
          </button>
        </div>

        {/* 4. Python CLI Script */}
        <div className="p-3.5 bg-[#131418] border border-[#262832] hover:border-[#FF764D]/50 rounded-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#FF764D]">ableton_builder.py</span>
              <FileCode className="w-4 h-4 text-[#FF764D]" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mb-3">
              Standalone Python script with CLI commands for batch conversion and direct User Library auto-injection.
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleDownloadPython}
              className="flex-1 py-1.5 px-2 rounded bg-[#20222A] hover:bg-[#282B36] border border-[#2B2E38] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 transition-colors"
            >
              {downloadedItem === 'py' ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-[#FF764D]" />}
              <span>.py</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="py-1.5 px-2.5 rounded bg-[#20222A] hover:bg-[#282B36] border border-[#2B2E38] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1 transition-colors"
              title="Download production_plan.json"
            >
              {downloadedItem === 'json' ? <Check className="w-3 h-3 text-emerald-400" /> : <span>.json</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
