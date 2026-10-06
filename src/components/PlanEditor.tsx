import React, { useState } from 'react';
import { ProductionPlan } from '../types/ableton';
import { PRESET_PRODUCTION_PLANS } from '../utils/presetPlans';
import { 
  Sparkles, 
  Code, 
  Check, 
  Copy, 
  RefreshCw, 
  Sliders, 
  Layers, 
  FileText, 
  AlertCircle,
  Wand2
} from 'lucide-react';

interface PlanEditorProps {
  plan: ProductionPlan;
  onUpdatePlan: (plan: ProductionPlan) => void;
}

export const PlanEditor: React.FC<PlanEditorProps> = ({ plan, onUpdatePlan }) => {
  const [jsonString, setJsonString] = useState<string>(JSON.stringify(plan, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'ai'>('visual');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleJsonChange = (val: string) => {
    setJsonString(val);
    try {
      const parsed = JSON.parse(val) as ProductionPlan;
      setJsonError(null);
      onUpdatePlan(parsed);
    } catch (err: unknown) {
      setJsonError((err as Error).message);
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    const selected = PRESET_PRODUCTION_PLANS[presetKey];
    if (selected) {
      onUpdatePlan(selected);
      setJsonString(JSON.stringify(selected, null, 2));
      setJsonError(null);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAiPlan = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate plan');
      }

      const data = await response.json();
      if (data.plan) {
        onUpdatePlan(data.plan);
        setJsonString(JSON.stringify(data.plan, null, 2));
        setActiveTab('visual');
      }
    } catch (err: unknown) {
      setAiError((err as Error).message || 'Error communicating with AI planner');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="bg-[#18191E] border border-[#2B2E38] rounded-xl p-4 shadow-xl">
      {/* Top Bar with Mode Switcher & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B2E38]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#FF764D]" />
          <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Production Plan (production_plan.json)
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#121316] p-0.5 rounded-lg border border-[#2B2E38]">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeTab === 'visual' ? 'bg-[#2B2E38] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visual Builder
          </button>
          <button
            onClick={() => {
              setJsonString(JSON.stringify(plan, null, 2));
              setActiveTab('json');
            }}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'json' ? 'bg-[#2B2E38] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>JSON Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'ai' ? 'bg-[#FF764D] text-black font-bold shadow' : 'text-[#FF764D] hover:bg-[#FF764D]/10'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Plan Generator</span>
          </button>
        </div>
      </div>

      {/* Preset Selector Banner */}
      <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#2B2E38]/60 text-xs">
        <span className="text-slate-400 font-medium">Quick Template Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handlePresetSelect('hyperpop-vocal')}
            className="px-2.5 py-1 rounded bg-[#20222A] hover:bg-[#2A2E3C] border border-[#2F3342] text-slate-200 transition-colors"
          >
            ✨ Hyperpop Lead Sparkle
          </button>
          <button
            onClick={() => handlePresetSelect('master-bus')}
            className="px-2.5 py-1 rounded bg-[#20222A] hover:bg-[#2A2E3C] border border-[#2F3342] text-slate-200 transition-colors"
          >
            🎛️ Master Glue &amp; Loudness
          </button>
          <button
            onClick={() => handlePresetSelect('trap-vocal-adlib')}
            className="px-2.5 py-1 rounded bg-[#20222A] hover:bg-[#2A2E3C] border border-[#2F3342] text-slate-200 transition-colors"
          >
            🎤 Trap Ad-Lib Telephone
          </button>
        </div>
      </div>

      {/* Tab 1: Visual Builder */}
      {activeTab === 'visual' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Project / Session Name
              </label>
              <input
                type="text"
                value={plan.projectName}
                onChange={(e) => onUpdatePlan({ ...plan, projectName: e.target.value })}
                className="w-full bg-[#121316] border border-[#2B2E38] rounded-md px-3 py-1.5 text-xs text-slate-100 focus:border-[#38EFE6] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Rack Preset Name (.adg)
              </label>
              <input
                type="text"
                value={plan.rackName}
                onChange={(e) => onUpdatePlan({ ...plan, rackName: e.target.value })}
                className="w-full bg-[#121316] border border-[#2B2E38] rounded-md px-3 py-1.5 text-xs text-slate-100 focus:border-[#38EFE6] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Musical Genre / Sub-Style
              </label>
              <input
                type="text"
                value={plan.genre}
                onChange={(e) => onUpdatePlan({ ...plan, genre: e.target.value })}
                className="w-full bg-[#121316] border border-[#2B2E38] rounded-md px-3 py-1.5 text-xs text-slate-100 focus:border-[#38EFE6] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tempo (BPM)
              </label>
              <input
                type="number"
                min="40"
                max="240"
                value={plan.tempo}
                onChange={(e) => onUpdatePlan({ ...plan, tempo: parseInt(e.target.value) || 120 })}
                className="w-full bg-[#121316] border border-[#2B2E38] rounded-md px-3 py-1.5 text-xs font-mono text-slate-100 focus:border-[#38EFE6] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tonal Key
              </label>
              <input
                type="text"
                value={plan.key}
                onChange={(e) => onUpdatePlan({ ...plan, key: e.target.value })}
                className="w-full bg-[#121316] border border-[#2B2E38] rounded-md px-3 py-1.5 text-xs font-mono text-slate-100 focus:border-[#38EFE6] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Scale Mode
              </label>
              <select
                value={plan.scale}
                onChange={(e) => onUpdatePlan({ ...plan, scale: e.target.value as ProductionPlan['scale'] })}
                className="w-full bg-[#121316] border border-[#2B2E38] rounded-md px-3 py-1.5 text-xs font-mono text-slate-100 focus:border-[#38EFE6] focus:outline-none"
              >
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
                <option value="Dorian">Dorian</option>
                <option value="Phrygian">Phrygian</option>
                <option value="Mixolydian">Mixolydian</option>
                <option value="Aeolian">Aeolian</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                User Library Subfolder
              </label>
              <input
                type="text"
                value={plan.userLibraryTargetSubfolder || 'AI Racks'}
                onChange={(e) => onUpdatePlan({ ...plan, userLibraryTargetSubfolder: e.target.value })}
                className="w-full bg-[#121316] border border-[#2B2E38] rounded-md px-3 py-1.5 text-xs text-slate-100 focus:border-[#38EFE6] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Production Plan Description &amp; Mixing Notes
            </label>
            <textarea
              rows={2}
              value={plan.description}
              onChange={(e) => onUpdatePlan({ ...plan, description: e.target.value })}
              className="w-full bg-[#121316] border border-[#2B2E38] rounded-md px-3 py-1.5 text-xs text-slate-200 focus:border-[#38EFE6] focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* Tab 2: JSON Editor */}
      {activeTab === 'json' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">
              Live bi-directional JSON schema sync
            </span>
            <button
              onClick={handleCopyJson}
              className="px-2.5 py-1 text-xs font-medium rounded bg-[#22242D] hover:bg-[#2C2F3C] text-slate-200 flex items-center gap-1.5 border border-[#2B2E38]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <textarea
            value={jsonString}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={14}
            className="w-full bg-[#101115] border border-[#2B2E38] rounded-lg p-3 text-xs font-mono text-emerald-400 focus:border-[#38EFE6] focus:outline-none leading-relaxed"
            spellCheck={false}
          />

          {jsonError && (
            <div className="mt-2 p-2.5 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>JSON Syntax Error: {jsonError}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: AI Plan Generator */}
      {activeTab === 'ai' && (
        <div className="mt-4 p-4 rounded-lg bg-[#141519] border border-[#2B2E38]">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-4 h-4 text-[#FF764D]" />
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              Generate Production Plan with Gemini AI
            </h4>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Describe the desired sound, artist reference, vocal processing style, genre, or key, and the AI will craft a complete production plan ready to inject into Ableton Live.
          </p>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. A lush Dream Pop vocal chain with high-pass filter, subtle tube warmth, shimmering cloud reverb, stereo chorus, and dynamic bus limiter at 118 BPM in E Major."
              className="w-full bg-[#1A1C22] border border-[#323644] rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-[#FF764D] focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAiPrompt("High-energy French Touch Disco House Master Bus with punchy SSL compression, tape saturation, and 124 BPM.")}
                  className="px-2 py-0.5 rounded bg-[#20222A] hover:bg-[#282B36] text-slate-300 border border-[#2B2E38]"
                >
                  💡 French House Bus
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt("Dark Cyberpunk Industrial Bass Mangler with split distortion bands, resonance filter, and sidechain limiter.")}
                  className="px-2 py-0.5 rounded bg-[#20222A] hover:bg-[#282B36] text-slate-300 border border-[#2B2E38]"
                >
                  💡 Cyberpunk Bass
                </button>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiPlan}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#FF764D] hover:bg-[#ff8966] disabled:opacity-50 text-black flex items-center gap-2 shadow"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Ableton Plan</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
