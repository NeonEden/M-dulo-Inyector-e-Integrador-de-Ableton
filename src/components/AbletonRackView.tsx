import React, { useState } from 'react';
import { ProductionPlan, ChainBranch, AbletonDevice } from '../types/ableton';
import { AbletonKnob } from './AbletonKnob';
import { 
  Sliders, 
  Layers, 
  Power, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Radio, 
  Activity
} from 'lucide-react';

interface AbletonRackViewProps {
  plan: ProductionPlan;
  onUpdatePlan: (updatedPlan: ProductionPlan) => void;
  onAuditionProgression?: () => void;
  isPlaying?: boolean;
}

export const AbletonRackView: React.FC<AbletonRackViewProps> = ({
  plan,
  onUpdatePlan,
  onAuditionProgression,
  isPlaying = false,
}) => {
  const [selectedChainId, setSelectedChainId] = useState<string>(plan.chains[0]?.id || '');
  const [showMacros, setShowMacros] = useState(true);
  const [showChains, setShowChains] = useState(true);
  const [activeTab, setActiveTab] = useState<'devices' | 'signal-flow'>('devices');

  const selectedChain = plan.chains.find(c => c.id === selectedChainId) || plan.chains[0];

  const handleMacroChange = (macroId: number, newVal: number) => {
    const updatedMacros = plan.macros.map(m => 
      m.id === macroId ? { ...m, value: newVal } : m
    );
    onUpdatePlan({ ...plan, macros: updatedMacros });
  };

  const handleChainVolumeChange = (chainId: string, volDb: number) => {
    const updatedChains = plan.chains.map(c => 
      c.id === chainId ? { ...c, volumeDb: volDb } : c
    );
    onUpdatePlan({ ...plan, chains: updatedChains });
  };

  const handleToggleMute = (chainId: string) => {
    const updatedChains = plan.chains.map(c => 
      c.id === chainId ? { ...c, muted: !c.muted } : c
    );
    onUpdatePlan({ ...plan, chains: updatedChains });
  };

  const handleToggleSolo = (chainId: string) => {
    const updatedChains = plan.chains.map(c => 
      c.id === chainId ? { ...c, solo: !c.solo } : c
    );
    onUpdatePlan({ ...plan, chains: updatedChains });
  };

  const handleToggleDevice = (chainId: string, deviceId: string) => {
    const updatedChains = plan.chains.map(c => {
      if (c.id !== chainId) return c;
      const updatedDevices = c.devices.map(d => 
        d.id === deviceId ? { ...d, enabled: !d.enabled } : d
      );
      return { ...c, devices: updatedDevices };
    });
    onUpdatePlan({ ...plan, chains: updatedChains });
  };

  return (
    <div className="bg-[#18191E] border border-[#2B2E38] rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Ableton Rack Header */}
      <div className="bg-[#20222A] px-4 py-2.5 border-b border-[#2B2E38] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Rack Power On/Off Button */}
          <button 
            className="w-5 h-5 rounded bg-[#FF764D] hover:bg-[#ff8966] text-black flex items-center justify-center shadow-sm transition-transform active:scale-95"
            title="Audio Effect Rack Power"
          >
            <Power className="w-3 h-3 stroke-[2.5]" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wide text-slate-100 uppercase">
              {plan.rackName || 'Audio Effect Rack'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              [{plan.genre}]
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Toggles (Macro, Chain, Devices) */}
          <button
            onClick={() => setShowMacros(!showMacros)}
            className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
              showMacros 
                ? 'bg-[#2E313D] text-[#38EFE6] border border-[#38EFE6]/40' 
                : 'bg-[#1C1D23] text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Toggle Macro Controls"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Macros</span>
          </button>

          <button
            onClick={() => setShowChains(!showChains)}
            className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
              showChains 
                ? 'bg-[#2E313D] text-[#EBF764] border border-[#EBF764]/40' 
                : 'bg-[#1C1D23] text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Toggle Chains List"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chains ({plan.chains.length})</span>
          </button>

          <div className="h-4 w-px bg-[#2B2E38] mx-1" />

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#15161A] p-0.5 rounded border border-[#2B2E38]">
            <button
              onClick={() => setActiveTab('devices')}
              className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                activeTab === 'devices' ? 'bg-[#2B2E38] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Devices
            </button>
            <button
              onClick={() => setActiveTab('signal-flow')}
              className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                activeTab === 'signal-flow' ? 'bg-[#2B2E38] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Signal Flow
            </button>
          </div>

          {onAuditionProgression && (
            <button
              onClick={onAuditionProgression}
              className={`ml-2 px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
                isPlaying 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
                  : 'bg-[#FF764D] hover:bg-[#ff8966] text-black shadow'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isPlaying ? 'Stop Audition' : 'Audition Audio'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Rack Body */}
      <div className="p-3 grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        
        {/* Macros Column */}
        {showMacros && (
          <div className={`${showChains ? 'xl:col-span-4' : 'xl:col-span-5'} bg-[#1C1D23] border border-[#2B2E38] rounded-lg p-3`}>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#2B2E38]/80">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#38EFE6]" />
                Macro Controls (16-Slot Engine)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {plan.macros.length} Active
              </span>
            </div>

            <div className="grid grid-cols-4 gap-y-3 gap-x-2">
              {Array.from({ length: 8 }).map((_, idx) => {
                const macro = plan.macros[idx];
                if (!macro) {
                  return (
                    <div key={idx} className="flex flex-col items-center opacity-30 select-none py-1">
                      <div className="w-9 h-9 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-[10px] font-mono text-slate-500">
                        {idx + 1}
                      </div>
                      <span className="text-[9px] text-slate-600 mt-1">Empty</span>
                    </div>
                  );
                }

                return (
                  <AbletonKnob
                    key={macro.id}
                    label={macro.name}
                    value={macro.value}
                    onChange={(val) => handleMacroChange(macro.id, val)}
                    color={macro.color || (idx % 2 === 0 ? '#38EFE6' : '#FF764D')}
                    min={macro.min ?? 0.0}
                    max={macro.max ?? 1.0}
                    size={42}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Chain List Column */}
        {showChains && (
          <div className={`${showMacros ? 'xl:col-span-3' : 'xl:col-span-4'} bg-[#1C1D23] border border-[#2B2E38] rounded-lg p-3`}>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2B2E38]/80">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#EBF764]" />
                Chain Mixer
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {plan.chains.length} Chains
              </span>
            </div>

            <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
              {plan.chains.map((chain, idx) => {
                const isSelected = chain.id === selectedChain?.id;
                return (
                  <div
                    key={chain.id}
                    onClick={() => setSelectedChainId(chain.id)}
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#2A2D37] border-[#38EFE6]/60 shadow-md' 
                        : 'bg-[#17181D] border-[#262830] hover:border-[#353844]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <div 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: idx === 0 ? '#38EFE6' : (idx === 1 ? '#FF764D' : '#EBF764') }} 
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {chain.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Solo */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleSolo(chain.id); }}
                          className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${
                            chain.solo ? 'bg-[#38EFE6] text-black' : 'bg-[#22242B] text-slate-400 hover:text-white'
                          }`}
                        >
                          S
                        </button>

                        {/* Mute */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleMute(chain.id); }}
                          className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${
                            chain.muted ? 'bg-amber-500 text-black' : 'bg-[#22242B] text-slate-400 hover:text-white'
                          }`}
                        >
                          {chain.muted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Volume Slider dB */}
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-24"
                        max="6"
                        step="0.5"
                        value={chain.volumeDb}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleChainVolumeChange(chain.id, parseFloat(e.target.value))}
                        className="w-full accent-[#38EFE6] h-1 bg-[#121316] rounded cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-slate-400 tabular-nums w-12 text-right">
                        {chain.volumeDb > 0 ? `+${chain.volumeDb.toFixed(1)}` : chain.volumeDb.toFixed(1)} dB
                      </span>
                    </div>

                    {/* Small device icons count */}
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-mono">
                      <span>{chain.devices.length} FX:</span>
                      <span className="truncate text-slate-300">
                        {chain.devices.map(d => d.name || d.type).join(' → ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Chain Devices Rack View */}
        <div className={`${showMacros && showChains ? 'xl:col-span-5' : 'xl:col-span-8'} bg-[#1C1D23] border border-[#2B2E38] rounded-lg p-3`}>
          {activeTab === 'devices' ? (
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#2B2E38]/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Chain Devices: {selectedChain?.name || 'No Chain'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#38EFE6]">
                  {selectedChain?.devices.length || 0} Native Modules
                </span>
              </div>

              {selectedChain?.devices && selectedChain.devices.length > 0 ? (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedChain.devices.map((device) => (
                    <DeviceCard 
                      key={device.id} 
                      device={device} 
                      onToggle={() => handleToggleDevice(selectedChain.id, device.id)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[#2B2E38] rounded-lg text-slate-400 text-xs">
                  No devices in this chain. Select or add a processing device.
                </div>
              )}
            </div>
          ) : (
            /* Signal Flow Node Graph */
            <SignalFlowGraph plan={plan} selectedChainId={selectedChain?.id} />
          )}
        </div>

      </div>
    </div>
  );
};

/**
 * Individual Device Visualizer Card
 */
const DeviceCard: React.FC<{ device: AbletonDevice; onToggle: () => void }> = ({ device, onToggle }) => {
  return (
    <div className={`p-2.5 rounded-md border transition-all ${
      device.enabled 
        ? 'bg-[#22242D] border-[#363A47]' 
        : 'bg-[#18191E] border-[#22242B] opacity-60'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center font-bold ${
              device.enabled ? 'bg-[#FF764D] text-black' : 'bg-slate-700 text-slate-400'
            }`}
            title="Toggle Device Power"
          >
            <Power className="w-2.5 h-2.5" />
          </button>
          <span className="text-xs font-bold text-slate-200">
            {device.name}
          </span>
          <span className="text-[10px] font-mono text-slate-400 px-1 py-0.5 rounded bg-[#16171C]">
            {device.type}
          </span>
        </div>
      </div>

      {/* Device Specialized Visualizer */}
      {device.type === 'Eq8' && (
        <div className="h-14 bg-[#141519] border border-[#252830] rounded p-2 flex items-center justify-between relative overflow-hidden">
          {/* Simulated EQ Curve Line */}
          <svg className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 200 60">
            <path
              d="M 0 50 Q 30 50 50 35 T 100 25 T 150 15 L 200 12"
              fill="none"
              stroke="#38EFE6"
              strokeWidth="2"
            />
          </svg>
          <div className="relative z-10 grid grid-cols-3 gap-2 w-full text-center">
            <div className="text-[10px] font-mono">
              <span className="text-slate-400 block">LowCut</span>
              <span className="text-[#38EFE6] font-bold">{device.parameters.lowCutFreq || 100} Hz</span>
            </div>
            <div className="text-[10px] font-mono">
              <span className="text-slate-400 block">Mid Gain</span>
              <span className="text-[#38EFE6] font-bold">+{device.parameters.midGain || 0.0} dB</span>
            </div>
            <div className="text-[10px] font-mono">
              <span className="text-slate-400 block">Air Gain</span>
              <span className="text-[#38EFE6] font-bold">+{device.parameters.highGain || 0.0} dB</span>
            </div>
          </div>
        </div>
      )}

      {device.type === 'Compressor2' && (
        <div className="h-14 bg-[#141519] border border-[#252830] rounded p-2 flex items-center justify-around">
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Threshold</span>
            <span className="text-xs text-[#FF764D] font-bold">{device.parameters.thresholdDb ?? -18} dB</span>
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Ratio</span>
            <span className="text-xs text-[#FF764D] font-bold">{device.parameters.ratio ?? 4}:1</span>
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Makeup</span>
            <span className="text-xs text-[#FF764D] font-bold">+{device.parameters.makeupGainDb ?? 3} dB</span>
          </div>
        </div>
      )}

      {device.type === 'Saturator' && (
        <div className="h-14 bg-[#141519] border border-[#252830] rounded p-2 flex items-center justify-around">
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Drive</span>
            <span className="text-xs text-[#EBF764] font-bold">+{device.parameters.driveDb ?? 4.5} dB</span>
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Output</span>
            <span className="text-xs text-[#EBF764] font-bold">{device.parameters.outputDb ?? -1.0} dB</span>
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Dry/Wet</span>
            <span className="text-xs text-[#EBF764] font-bold">{Math.round(((device.parameters.dryWet as number) ?? 0.8) * 100)}%</span>
          </div>
        </div>
      )}

      {device.type === 'Reverb' && (
        <div className="h-14 bg-[#141519] border border-[#252830] rounded p-2 flex items-center justify-around">
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Decay</span>
            <span className="text-xs text-[#A78BFA] font-bold">{device.parameters.decayTimeSec ?? 2.8} s</span>
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Size</span>
            <span className="text-xs text-[#A78BFA] font-bold">{device.parameters.roomSize ?? 75}%</span>
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Wet</span>
            <span className="text-xs text-[#A78BFA] font-bold">{Math.round(((device.parameters.dryWet as number) ?? 0.35) * 100)}%</span>
          </div>
        </div>
      )}

      {device.type === 'Delay' && (
        <div className="h-14 bg-[#141519] border border-[#252830] rounded p-2 flex items-center justify-around">
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Feedback</span>
            <span className="text-xs text-[#34D399] font-bold">{Math.round(((device.parameters.feedback as number) ?? 0.45) * 100)}%</span>
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Mode</span>
            <span className="text-xs text-[#34D399] font-bold">Ping-Pong</span>
          </div>
        </div>
      )}

      {device.type === 'Utility' && (
        <div className="h-14 bg-[#141519] border border-[#252830] rounded p-2 flex items-center justify-around">
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Stereo Width</span>
            <span className="text-xs text-[#F472B6] font-bold">{Math.round(((device.parameters.width as number) ?? 1.0) * 100)}%</span>
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Bass Mono</span>
            <span className="text-xs text-[#F472B6] font-bold">{device.parameters.bassMono ? '120 Hz' : 'Off'}</span>
          </div>
        </div>
      )}

      {device.type === 'Limiter' && (
        <div className="h-14 bg-[#141519] border border-[#252830] rounded p-2 flex items-center justify-around">
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Gain</span>
            <span className="text-xs text-[#EF4444] font-bold">+{device.parameters.gainDb ?? 2.0} dB</span>
          </div>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-400 block">Ceiling</span>
            <span className="text-xs text-[#EF4444] font-bold">{device.parameters.ceilingDb ?? -0.3} dB</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Signal Flow Node Graph
 */
const SignalFlowGraph: React.FC<{ plan: ProductionPlan; selectedChainId?: string }> = ({ plan, selectedChainId }) => {
  return (
    <div className="p-3 bg-[#141519] border border-[#252830] rounded-lg">
      <div className="text-[11px] font-mono text-slate-400 mb-3 flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-[#38EFE6]" />
        <span>Audio Signal Routing &amp; Summing Graph</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Input Node */}
        <div className="px-3 py-2 rounded bg-[#20222A] border border-[#38EFE6]/40 text-center">
          <span className="text-[10px] text-slate-400 block font-mono">IN</span>
          <span className="font-bold text-[#38EFE6]">Audio Input</span>
        </div>

        <div className="text-slate-500 font-mono">➔ Splitter ➔</div>

        {/* Parallel Branches */}
        <div className="flex-1 space-y-2 w-full">
          {plan.chains.map((chain, idx) => (
            <div 
              key={chain.id}
              className={`p-2 rounded border flex items-center justify-between ${
                chain.id === selectedChainId ? 'bg-[#222530] border-[#38EFE6]' : 'bg-[#1A1C22] border-[#2B2E38]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">Branch {idx + 1}:</span>
                <span className="font-semibold text-slate-200">{chain.name}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="text-slate-400">{chain.devices.length} Devices</span>
                <span className="text-[#38EFE6]">[{chain.volumeDb} dB]</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-slate-500 font-mono">➔ Summing ➔</div>

        {/* Output Node */}
        <div className="px-3 py-2 rounded bg-[#20222A] border border-[#FF764D]/40 text-center">
          <span className="text-[10px] text-slate-400 block font-mono">OUT</span>
          <span className="font-bold text-[#FF764D]">Master Out</span>
        </div>
      </div>
    </div>
  );
};
