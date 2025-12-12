
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  PenTool, 
  Download, 
  Copy, 
  Loader2, 
  ClipboardCheck,
  Copyright
} from 'lucide-react';
import { generateCopyrightNotice } from '../services/geminiService';
import { getIdentityProfile } from '../services/storage';

interface NameGuardProps {
  notify?: (type: 'success'|'error'|'info', msg: string) => void;
}

const NameGuard: React.FC<NameGuardProps> = ({ notify }) => {
  const [formData, setFormData] = useState({
    tradename: '',
    owner: '',
    registrationDate: new Date().toLocaleDateString(),
    feeSchedule: '$500,000.00 USD per unauthorized use'
  });
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const profile = getIdentityProfile();
    if (profile) setHasProfile(true);
  }, []);

  const handleAutoFill = () => {
    const profile = getIdentityProfile();
    if (profile) {
      setFormData(prev => ({
        ...prev,
        tradename: profile.legalName || prev.tradename,
        owner: profile.livingName || prev.owner
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const text = await generateCopyrightNotice(formData);
      setGeneratedDoc(text || '');
      notify?.('success', 'Copyright Notice Generated.');
    } catch (e) {
      console.error(e);
      notify?.('error', 'Failed to generate copyright notice.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="w-full lg:w-1/3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
            Trade Name Authority
          </h2>
          <p className="text-slate-400 mt-2">
            Establish Common Law Copyright over the ALL CAPS legal fiction. This is the first step before assigning it to a trust.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 relative">
          {hasProfile && (
            <button 
              onClick={handleAutoFill}
              className="absolute top-6 right-6 text-xs bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-indigo-900/50 border border-indigo-500/20 transition-colors"
            >
              <ClipboardCheck className="w-3 h-3" /> Auto-fill
            </button>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Trade Name (Property)</label>
            <input 
              type="text"
              name="tradename"
              value={formData.tradename}
              onChange={handleChange}
              placeholder="JOHN HENRY DOE"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Copyright Owner (You)</label>
            <input 
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              placeholder="John Henry: Doe"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Unauthorized Use Fee</label>
            <input 
              type="text"
              name="feeSchedule"
              value={formData.feeSchedule}
              onChange={handleChange}
              placeholder="$500,000.00"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.tradename}
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Copyright className="w-4 h-4" />}
            Generate Notice
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-[600px] lg:h-auto bg-slate-100 rounded-lg text-slate-900 p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-12 bg-slate-200 border-b border-slate-300 flex items-center justify-between px-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Preview</span>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-slate-300 rounded text-slate-600" title="Copy">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-300 rounded text-slate-600" title="Download PDF">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto font-serif text-sm leading-relaxed whitespace-pre-wrap max-w-2xl mx-auto w-full">
          {generatedDoc ? generatedDoc : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 select-none">
              <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
              <p>Secure the name to secure the estate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NameGuard;
