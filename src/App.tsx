import React, { useState } from 'react';
import { ProductionPlan } from './types/ableton';
import { PRESET_PRODUCTION_PLANS } from './utils/presetPlans';
import { AbletonRackView } from './components/AbletonRackView';
import { ArrangementTimeline } from './components/ArrangementTimeline';
import { PlanEditor } from './components/PlanEditor';
import { XmlInspector } from './components/XmlInspector';
import { PythonScriptView } from './components/PythonScriptView';
import { ExportModal } from './components/ExportModal';
import { audioPreview } from './utils/audioPreview';
import { 
  Sliders, 
  Layers, 
  Terminal, 
  FileCode, 
  Package, 
  Sparkles, 
  Music, 
  Radio, 
  Square,
  Play,
  CheckCircle2,
  FolderSync
} from 'lucide-react';

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<ProductionPlan>(
    PRESET_PRODUCTION_PLANS['hyperpop-vocal']
  );
  const [activeSection, setActiveSection] = useState<'rack' | 'timeline' | 'plan' | 'xml' | 'python' | 'export'>('rack');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleAuditionToggle = () => {
    if (isPlayingAudio) {
      audioPreview.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audioPreview.playProgression(currentPlan.chords, currentPlan.tempo, currentPlan, (stepIdx) => {
        if (stepIdx === -1) setIsPlayingAudio(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#111215] text-[#E0E2EC] flex flex-col font-sans">
      
      {/* Top Bar Contract (3-Zone: Wordmark, 4-6 Clean Text Links, Primary Action) */}
      <header className="bg-[#18191E] border-b border-[#252832] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#FF764D] flex items-center justify-center font-black text-black text-xs tracking-tighter">
            AB
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Ableton Builder &amp; Injector Studio
          </span>
        </div>

        {/* Zone 2: Navigation views */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#131418] p-1 rounded-lg border border-[#23252E]">
          <button
            onClick={() => setActiveSection('rack')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSection === 'rack' ? 'bg-[#282B36] text-[#38EFE6] shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Audio Rack</span>
          </button>

          <button
            onClick={() => setActiveSection('timeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSection === 'timeline' ? 'bg-[#282B36] text-[#EBF764] shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Timeline &amp; Chords</span>
          </button>

          <button
            onClick={() => setActiveSection('plan')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSection === 'plan' ? 'bg-[#282B36] text-[#FF764D] shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan &amp; AI</span>
          </button>

          <button
            onClick={() => setActiveSection('xml')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSection === 'xml' ? 'bg-[#282B36] text-[#A78BFA] shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>XML Engine</span>
          </button>

          <button
            onClick={() => setActiveSection('python')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSection === 'python' ? 'bg-[#282B36] text-[#34D399] shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>ableton_builder.py</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAuditionToggle}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              isPlayingAudio 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
                : 'bg-[#20222A] hover:bg-[#2A2E3C] text-slate-200 border border-[#2B2E38]'
            }`}
          >
            {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current text-[#38EFE6]" />}
            <span className="hidden sm:inline">{isPlayingAudio ? 'Stop Sound' : 'Audition Audio'}</span>
          </button>

          <button
            onClick={() => setActiveSection('export')}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#FF764D] hover:bg-[#ff8966] text-black shadow flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Export Ableton Files</span>
          </button>
        </div>
      </header>

      {/* Hero / Studio Workspace Banner */}
      <div className="bg-[#15161B] border-b border-[#22242D] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono text-[#38EFE6] uppercase tracking-wider">
                Ableton Live 11 &amp; 12 GZIP XML Generator
              </span>
              <span className="text-slate-600 font-mono">·</span>
              <span className="text-[11px] text-slate-400 font-mono">Native .adg &amp; .als</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentPlan.projectName.replace(/_/g, ' ')}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {currentPlan.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-[#1D1F27] px-3 py-1.5 rounded-lg border border-[#2B2E38] text-xs font-mono">
              <span className="text-slate-400">Tempo:</span>{' '}
              <span className="text-white font-bold">{currentPlan.tempo} BPM</span>
            </div>
            <div className="bg-[#1D1F27] px-3 py-1.5 rounded-lg border border-[#2B2E38] text-xs font-mono">
              <span className="text-slate-400">Key:</span>{' '}
              <span className="text-[#38EFE6] font-bold">{currentPlan.key} {currentPlan.scale}</span>
            </div>
            <div className="bg-[#1D1F27] px-3 py-1.5 rounded-lg border border-[#2B2E38] text-xs font-mono">
              <span className="text-slate-400">Chains:</span>{' '}
              <span className="text-[#EBF764] font-bold">{currentPlan.chains.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Active Section Content */}
        {activeSection === 'rack' && (
          <div className="space-y-6">
            <AbletonRackView
              plan={currentPlan}
              onUpdatePlan={setCurrentPlan}
              onAuditionProgression={handleAuditionToggle}
              isPlaying={isPlayingAudio}
            />

            <ArrangementTimeline
              plan={currentPlan}
              onUpdatePlan={setCurrentPlan}
            />

            <ExportModal plan={currentPlan} />
          </div>
        )}

        {activeSection === 'timeline' && (
          <div className="space-y-6">
            <ArrangementTimeline
              plan={currentPlan}
              onUpdatePlan={setCurrentPlan}
            />

            <AbletonRackView
              plan={currentPlan}
              onUpdatePlan={setCurrentPlan}
              onAuditionProgression={handleAuditionToggle}
              isPlaying={isPlayingAudio}
            />
          </div>
        )}

        {activeSection === 'plan' && (
          <div className="space-y-6">
            <PlanEditor
              plan={currentPlan}
              onUpdatePlan={setCurrentPlan}
            />

            <AbletonRackView
              plan={currentPlan}
              onUpdatePlan={setCurrentPlan}
              onAuditionProgression={handleAuditionToggle}
              isPlaying={isPlayingAudio}
            />
          </div>
        )}

        {activeSection === 'xml' && (
          <div className="space-y-6">
            <XmlInspector plan={currentPlan} />
          </div>
        )}

        {activeSection === 'python' && (
          <div className="space-y-6">
            <PythonScriptView plan={currentPlan} />
          </div>
        )}

        {activeSection === 'export' && (
          <div className="space-y-6">
            <ExportModal plan={currentPlan} />
            <PythonScriptView plan={currentPlan} />
          </div>
        )}

      </main>

      {/* Quiet Footer */}
      <footer className="bg-[#141519] border-t border-[#22242D] px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ableton Live Gzip XML Engine (.adg &amp; .als format compliant)</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveSection('python')} 
              className="hover:text-slate-200 transition-colors"
            >
              Python CLI Script
            </button>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => setActiveSection('xml')} 
              className="hover:text-slate-200 transition-colors"
            >
              XML Inspector
            </button>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => setActiveSection('export')} 
              className="hover:text-slate-200 transition-colors font-medium text-[#FF764D]"
            >
              Export Bundle (.zip)
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
