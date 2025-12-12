
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  PenTool, 
  Download, 
  Copy,
  Loader2,
  ClipboardCheck,
  Upload,
  FileSearch,
  ArrowRight
} from 'lucide-react';
import { generateFCRADispute, analyzeCreditReport } from '../services/geminiService';
import { getIdentityProfile } from '../services/storage';
import { CreditReportAnalysis, NotifyFn } from '../types';

interface FCRADisputeProps {
  notify?: NotifyFn;
  initialData?: any;
}

const FCRADispute: React.FC<FCRADisputeProps> = ({ notify, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    disputeItem: '',
  });
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  
  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<CreditReportAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const profile = getIdentityProfile();
    if (profile) {
      setHasProfile(true);
    }
    
    // Check for data passed from InstrumentParser
    if (initialData && initialData.disputeItem) {
        setFormData(prev => ({
            ...prev,
            disputeItem: initialData.disputeItem,
            name: profile?.legalName || prev.name,
            address: profile?.mailingAddress || prev.address
        }));
    }
  }, [initialData]);

  const handleAutoFill = () => {
    const profile = getIdentityProfile();
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.legalName || '',
        address: profile.mailingAddress || ''
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        notify?.('error', "File too large. Max size 5MB.");
        return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            const mimeType = file.type || 'application/pdf';
            const jsonString = await analyzeCreditReport(base64Data, mimeType);
            
            if (jsonString) {
                const cleaned = jsonString.replace(/```json\n/g, '').replace(/\n```/g, '');
                setAnalysisResult(JSON.parse(cleaned));
                notify?.('success', 'Credit report analyzed successfully.');
            }
        } catch (err) {
            console.error(err);
            notify?.('error', 'Failed to analyze credit report. Ensure image/PDF is clear.');
        } finally {
            setIsAnalyzing(false);
        }
    };
    reader.readAsDataURL(file);
  };

  const selectDisputeItem = (item: any) => {
      const description = `Account: ${item.account_number} (${item.creditor}) - Listed as ${item.reason} on ${item.date}. Verification demanded per FCRA 609.`;
      setFormData(prev => ({
          ...prev,
          disputeItem: description
      }));
      notify?.('info', "Dispute item selected.");
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const text = await generateFCRADispute(formData);
      setGeneratedDoc(text || '');
    } catch (e) {
      console.error(e);
      notify?.('error', "Failed to generate dispute letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="w-full lg:w-1/3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-pink-500" />
            FCRA 609 Dispute
          </h2>
          <p className="text-slate-400 mt-2">
            Demand verification of debt under FCRA Section 609/611.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 relative">
          
          {/* Analysis Section */}
          <div className="mb-6 p-4 bg-slate-950 border border-slate-800 rounded-lg">
             <div className="flex items-center justify-between mb-3">
                 <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2">
                    <FileSearch className="w-4 h-4" /> Analyze Report
                 </h3>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isAnalyzing}
                   className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                 >
                   <Upload className="w-3 h-3" /> Upload PDF
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="application/pdf,image/*"
                 />
             </div>
             
             {isAnalyzing && (
                 <div className="text-center py-4 text-xs text-pink-400 flex items-center justify-center gap-2">
                     <Loader2 className="w-3 h-3 animate-spin" /> Scanning negative items...
                 </div>
             )}

             {analysisResult && (
                 <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
                     <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Detected Negative Items:</p>
                     {analysisResult.negative_items?.length > 0 ? (
                         analysisResult.negative_items.map((item, i) => (
                             <button 
                               key={i} 
                               onClick={() => selectDisputeItem(item)}
                               className="w-full text-left p-2 bg-pink-900/10 hover:bg-pink-900/20 border border-pink-500/20 rounded text-xs text-pink-200 transition-colors group"
                             >
                                <div className="flex justify-between font-bold">
                                    <span>{item.creditor}</span>
                                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="text-[10px] opacity-70">{item.reason}</div>
                             </button>
                         ))
                     ) : (
                         <p className="text-xs text-slate-500 italic">No items found.</p>
                     )}
                 </div>
             )}
          </div>

          {hasProfile && (
            <button 
              onClick={handleAutoFill}
              className="absolute top-6 right-6 text-xs bg-pink-900/30 text-pink-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-pink-900/50 border border-pink-500/20 transition-colors"
            >
              <ClipboardCheck className="w-3 h-3" /> Auto-fill
            </button>
          )}
          
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Consumer Name</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Henry Doe"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Mailing Address</label>
            <input 
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Sovereign Lane"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Disputed Item / Account</label>
            <textarea 
              name="disputeItem"
              value={formData.disputeItem}
              onChange={handleChange}
              placeholder="Account #12345 (Creditor Name) - Late Payment listed on 01/2025"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-pink-500 focus:outline-none h-24 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.name}
            className="w-full mt-4 py-3 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <PenTool className="w-4 h-4" />}
            Generate Dispute Letter
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
              <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
              <p>Enter dispute details to generate letter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FCRADispute;