import React, { useState } from 'react';
import { ProductionPlan } from '../types/ableton';
import { generatePythonScriptCode } from '../utils/pythonScriptGenerator';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  FolderDown, 
  HelpCircle, 
  Apple, 
  Laptop
} from 'lucide-react';

interface PythonScriptViewProps {
  plan: ProductionPlan;
}

export const PythonScriptView: React.FC<PythonScriptViewProps> = ({ plan }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const pythonScript = generatePythonScriptCode(plan);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ableton_builder.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCliCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="bg-[#18191E] border border-[#2B2E38] rounded-xl p-4 shadow-xl flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B2E38]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#38EFE6]" />
          <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Standalone Python Script (ableton_builder.py)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyScript}
            className="px-2.5 py-1 text-xs font-medium rounded bg-[#22242D] hover:bg-[#2C2F3C] text-slate-200 flex items-center gap-1.5 border border-[#2B2E38]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Python Script'}</span>
          </button>

          <button
            onClick={handleDownloadScript}
            className="px-3 py-1 text-xs font-bold rounded bg-[#38EFE6] hover:bg-[#5cf2ea] text-black flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ableton_builder.py</span>
          </button>
        </div>
      </div>

      {/* OS User Library Path Directory Integration Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-[#131418] border border-[#262832] rounded-lg">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-200">
            <Apple className="w-4 h-4 text-slate-300" />
            <span>macOS Ableton User Library Path</span>
          </div>
          <code className="text-[11px] font-mono text-[#38EFE6] block bg-[#0D0E12] p-2 rounded border border-[#1E2028] break-all select-all">
            ~/Music/Ableton/User Library/Presets/Audio Effects/Audio Effect Rack
          </code>
        </div>

        <div className="p-3 bg-[#131418] border border-[#262832] rounded-lg">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-200">
            <Laptop className="w-4 h-4 text-slate-300" />
            <span>Windows Ableton User Library Path</span>
          </div>
          <code className="text-[11px] font-mono text-[#EBF764] block bg-[#0D0E12] p-2 rounded border border-[#1E2028] break-all select-all">
            %USERPROFILE%\Documents\Ableton\User Library\Presets\Audio Effects\Audio Effect Rack
          </code>
        </div>
      </div>

      {/* Terminal CLI Execution Snippets */}
      <div className="p-3 bg-[#131418] border border-[#262832] rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Quick Terminal Command (Direct Library Injection)
          </span>
          <button
            onClick={() => handleCopyCliCommand('python ableton_builder.py --input production_plan.json --target-library')}
            className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
          >
            {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy CLI</span>
          </button>
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          <div className="bg-[#0C0D11] p-2 rounded text-slate-300 border border-[#1F2129] flex items-center justify-between">
            <span className="text-emerald-400">
              $ python ableton_builder.py --input production_plan.json --target-library
            </span>
          </div>
          <div className="bg-[#0C0D11] p-2 rounded text-slate-300 border border-[#1F2129]">
            <span className="text-slate-400"># Or export to custom folder:</span>
            <span className="text-emerald-400 block mt-0.5">
              $ python ableton_builder.py --input production_plan.json --output-dir ./MySession
            </span>
          </div>
        </div>
      </div>

      {/* Script Source Code Viewer */}
      <div className="bg-[#101115] border border-[#22252E] rounded-lg p-3 overflow-x-auto max-h-[340px] font-mono text-xs text-slate-300 leading-relaxed">
        <pre>{pythonScript}</pre>
      </div>
    </div>
  );
};
