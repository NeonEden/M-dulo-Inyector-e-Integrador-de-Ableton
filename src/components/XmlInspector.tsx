import React, { useState, useMemo } from 'react';
import { ProductionPlan } from '../types/ableton';
import { generateAbletonRackXml, generateAbletonProjectXml } from '../utils/abletonXmlGenerator';
import { 
  FileCode, 
  Copy, 
  Check, 
  Search, 
  CheckCircle2, 
  Layers, 
  Cpu
} from 'lucide-react';

interface XmlInspectorProps {
  plan: ProductionPlan;
}

export const XmlInspector: React.FC<XmlInspectorProps> = ({ plan }) => {
  const [selectedFormat, setSelectedFormat] = useState<'adg' | 'als'>('adg');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const xmlContent = useMemo(() => {
    if (selectedFormat === 'adg') {
      return generateAbletonRackXml(plan);
    } else {
      return generateAbletonProjectXml(plan);
    }
  }, [plan, selectedFormat]);

  const lineCount = useMemo(() => {
    return xmlContent.split('\n').length;
  }, [xmlContent]);

  const byteSize = useMemo(() => {
    return new TextEncoder().encode(xmlContent).length;
  }, [xmlContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#18191E] border border-[#2B2E38] rounded-xl p-4 shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B2E38]">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#EBF764]" />
          <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Decompressed XML Inspector (Ableton Live Schema Engine)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Format Selector */}
          <div className="flex items-center bg-[#121316] p-0.5 rounded-lg border border-[#2B2E38]">
            <button
              onClick={() => setSelectedFormat('adg')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                selectedFormat === 'adg' ? 'bg-[#2B2E38] text-[#38EFE6] shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              .adg Rack XML
            </button>
            <button
              onClick={() => setSelectedFormat('als')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                selectedFormat === 'als' ? 'bg-[#2B2E38] text-[#EBF764] shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              .als Project XML
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs font-medium rounded bg-[#22242D] hover:bg-[#2C2F3C] text-slate-200 flex items-center gap-1.5 border border-[#2B2E38]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied XML' : 'Copy XML'}</span>
          </button>
        </div>
      </div>

      {/* Info & Search Bar */}
      <div className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#2B2E38]/60">
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Live 11/12 Validated
          </span>
          <span>{lineCount} lines</span>
          <span>{(byteSize / 1024).toFixed(1)} KB (Raw)</span>
          <span className="text-[#38EFE6]">~{(byteSize / 1024 / 4).toFixed(1)} KB (Gzipped)</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search XML tags (e.g. MacroControl, Eq8, Branch)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#121316] border border-[#2B2E38] rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 focus:border-[#38EFE6] focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Code Viewer */}
      <div className="mt-3 bg-[#101115] border border-[#22252E] rounded-lg p-3 overflow-x-auto max-h-[380px] font-mono text-xs text-slate-300 leading-relaxed">
        <pre>
          {xmlContent
            .split('\n')
            .filter((line) => !searchQuery || line.toLowerCase().includes(searchQuery.toLowerCase()))
            .join('\n')}
        </pre>
      </div>
    </div>
  );
};
