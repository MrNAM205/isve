
import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  ShieldAlert, 
  Play, 
  Plus, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  X,
  FileText
} from 'lucide-react';
import { CallScript, NotifyFn } from '../types';
import { getCallScripts, saveCallScript } from '../services/storage';
import { generateCallScript } from '../services/geminiService';

interface TeleCounselProps {
  notify?: NotifyFn;
}

const TeleCounsel: React.FC<TeleCounselProps> = ({ notify }) => {
  const [scripts, setScripts] = useState<CallScript[]>([]);
  const [activeScript, setActiveScript] = useState<CallScript | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setScripts(getCallScripts());
  }, []);

  const handleGenerate = async () => {
    if (!customPrompt) return;
    setIsGenerating(true);
    try {
      const newScript = await generateCallScript(customPrompt);
      // Ensure ID is unique if not provided by AI or conflict
      newScript.id = crypto.randomUUID();
      saveCallScript(newScript);
      setScripts(getCallScripts());
      setActiveScript(newScript);
      setStepIndex(0);
      setCustomPrompt('');
      notify?.('success', 'Tactical script generated.');
    } catch (e) {
      notify?.('error', 'Failed to generate script. Try a simpler prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectScript = (script: CallScript) => {
    setActiveScript(script);
    setStepIndex(0);
  };

  const nextStep = () => {
    if (activeScript && stepIndex < activeScript.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar / Generator */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <PhoneCall className="w-8 h-8 text-cyan-500" />
            TeleCounsel
          </h2>
          <p className="text-slate-400 mt-2">
            Tactical scripts and teleprompter for engaging corporate agents in real-time.
          </p>
        </div>

        {/* Generator */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
           <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Generate New Script</label>
           <textarea 
             value={customPrompt}
             onChange={(e) => setCustomPrompt(e.target.value)}
             placeholder="Describe the scenario (e.g. 'Traffic stop with police', 'IRS Auditor call')..."
             className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:border-cyan-500 focus:outline-none h-24 resize-none text-sm"
           />
           <button 
             onClick={handleGenerate}
             disabled={isGenerating || !customPrompt}
             className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
           >
             {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Plus className="w-4 h-4" />}
             Generate Script
           </button>
        </div>

        {/* Saved Scripts List */}
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 overflow-hidden flex flex-col">
           <h3 className="text-sm font-semibold text-white mb-3">Saved Scenarios</h3>
           <div className="flex-1 overflow-y-auto space-y-2">
              {scripts.length === 0 && (
                <div className="text-center text-slate-500 py-4 text-xs">
                  No scripts found. Generate one above.
                </div>
              )}
              {scripts.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectScript(s)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${activeScript?.id === s.id ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <div className="font-bold text-sm truncate">{s.title}</div>
                  <div className="text-xs opacity-70 truncate">{s.description}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {s.tags?.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Teleprompter View */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 flex flex-col relative overflow-hidden">
         {activeScript ? (
           <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                 <div>
                   <h3 className="text-lg font-bold text-white">{activeScript.title}</h3>
                   <p className="text-xs text-slate-500 truncate max-w-md">{activeScript.description}</p>
                 </div>
                 <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                    <button onClick={prevStep} disabled={stepIndex === 0} className="p-2 hover:bg-slate-700 rounded disabled:opacity-30">
                       <ChevronLeft className="w-5 h-5 text-slate-300" />
                    </button>
                    <span className="text-sm font-mono text-cyan-400 px-2 min-w-[60px] text-center">
                      {stepIndex + 1} / {activeScript.steps.length}
                    </span>
                    <button onClick={nextStep} disabled={stepIndex === activeScript.steps.length - 1} className="p-2 hover:bg-slate-700 rounded disabled:opacity-30">
                       <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
                 </div>
              </div>

              {/* Prompter Content */}
              <div className="flex-1 p-8 flex flex-col justify-center items-center text-center overflow-y-auto">
                 <div className="max-w-2xl w-full">
                    <h4 className="text-sm font-mono text-cyan-500 uppercase tracking-widest mb-6">
                      Step: {activeScript.steps[stepIndex].label}
                    </h4>
                    
                    <div className="text-2xl md:text-3xl font-medium text-white leading-relaxed mb-8 select-text">
                      "{activeScript.steps[stepIndex].text}"
                    </div>

                    {activeScript.steps[stepIndex].guidance && (
                      <div className="bg-amber-900/10 border border-amber-500/20 p-4 rounded-lg inline-flex items-start gap-3 text-left max-w-xl">
                         <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                         <div>
                            <span className="text-xs font-bold text-amber-500 uppercase block mb-1">Tactical Guidance</span>
                            <p className="text-sm text-slate-300">{activeScript.steps[stepIndex].guidance}</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Objections Panel */}
              <div className="bg-slate-900 border-t border-slate-800 p-4">
                 <h4 className="text-xs font-mono text-slate-500 uppercase mb-3 flex items-center gap-2">
                   <ShieldAlert className="w-3 h-3" /> Objection Handlers
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                    {activeScript.objections.map((obj, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded hover:border-red-500/30 transition-colors group">
                         <div className="text-xs text-red-400 font-bold mb-1 group-hover:text-red-300">If they say: "{obj.trigger}"</div>
                         <div className="text-xs text-slate-300">You say: "{obj.response}"</div>
                      </div>
                    ))}
                    {activeScript.objections.length === 0 && (
                      <div className="text-xs text-slate-500 italic">No objections defined for this script.</div>
                    )}
                 </div>
              </div>
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <PhoneCall className="w-16 h-16 mb-4 opacity-20" />
              <p>Select or Generate a script to initialize the TeleCounsel.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default TeleCounsel;
