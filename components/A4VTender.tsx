
import React, { useState, useEffect } from 'react';
import { 
  ScrollText, 
  PenTool, 
  Download, 
  Copy,
  Loader2,
  ClipboardCheck
} from 'lucide-react';
import { generateA4VLetter } from '../services/geminiService';
import { getIdentityProfile } from '../services/storage';

const A4VTender: React.FC = () => {
  const [formData, setFormData] = useState({
    creditorName: '',
    accountNumber: '',
    amount: '',
    taxId: '',
  });
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const profile = getIdentityProfile();
    if (profile && profile.taxId) {
      setHasProfile(true);
    }
  }, []);

  const handleAutoFill = () => {
    const profile = getIdentityProfile();
    if (profile) {
      setFormData(prev => ({
        ...prev,
        taxId: profile.taxId || prev.taxId
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const text = await generateA4VLetter(formData);
      setGeneratedDoc(text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="w-full lg:w-1/3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-amber-500" />
            A4V Tender Process
          </h2>
          <p className="text-slate-400 mt-2">
            Create an "Accepted for Value" endorsement letter to discharge public debt using your exemption.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 relative">
          {hasProfile && (
            <button 
              onClick={handleAutoFill}
              className="absolute top-6 right-6 text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-amber-900/50 border border-amber-500/20 transition-colors"
            >
              <ClipboardCheck className="w-3 h-3" /> Auto-fill
            </button>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Creditor Name</label>
            <input 
              type="text"
              name="creditorName"
              value={formData.creditorName}
              onChange={handleChange}
              placeholder="CHASE BANK NA"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Account / Ref Number</label>
            <input 
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="1234-5678-9000"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Amount to Discharge</label>
            <input 
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="$1,500.00"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Exemption ID (SSN/EIN)</label>
            <input 
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              placeholder="XXX-XX-XXXX"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.creditorName}
            className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <PenTool className="w-4 h-4" />}
            Generate Tender Letter
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-[600px] lg:h-auto bg-slate-900/50 rounded-lg p-4 lg:p-8 overflow-hidden relative border border-slate-800">
        <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Preview</span>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400" title="Copy">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400" title="Download PDF">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto">
          {generatedDoc ? (
            <div className="bg-white text-black p-12 shadow-2xl min-h-[800px] w-full max-w-[800px] mx-auto font-serif text-sm leading-relaxed whitespace-pre-wrap selection:bg-amber-200 selection:text-black">
              {generatedDoc}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 select-none">
              <ScrollText className="w-16 h-16 mb-4 opacity-20" />
              <p>Enter instrument details to generate your endorsement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default A4VTender;