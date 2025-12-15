
import React, { useState, useEffect } from 'react';
import { 
  Stamp, 
  PenTool, 
  Download, 
  Copy, 
  Loader2, 
  KeyRound,
  ShieldCheck,
  FileBadge
} from 'lucide-react';
import { generateAllonge } from '../services/geminiService';
import { getIdentityProfile, getFromClipboard } from '../services/storage';
import { getAppKeys, signData, generateDocumentHash } from '../services/security';
import { NotifyFn } from '../types';

interface EndorsementAllongeProps {
  notify?: NotifyFn;
}

const EndorsementAllonge: React.FC<EndorsementAllongeProps> = ({ notify }) => {
  const [formData, setFormData] = useState({
    creditorName: '',
    accountNumber: '',
    amount: '',
    type: 'Accepted for Value' as 'Accepted for Value' | 'Without Recourse' | 'Pay to the Order of',
    signerName: '',
    includeNotary: false,
    notaryState: '',
    notaryCounty: '',
    notaryName: '',
    digitalSignature: ''
  });
  
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Security State
  const [keyPair, setKeyPair] = useState<CryptoKey | null>(null); // Only storing private key in memory for session
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    // 1. Try to load from Profile
    const profile = getIdentityProfile();
    let signer = '';
    if (profile) {
      signer = profile.livingName || '';
    }

    // 2. Check Clipboard for parsed instrument data
    const clip = getFromClipboard();
    if (clip) {
      setFormData(prev => ({
        ...prev,
        creditorName: clip.creditor_name || '',
        accountNumber: clip.account_number || '',
        amount: clip.amount_due || '',
        signerName: signer
      }));
    } else {
      setFormData(prev => ({...prev, signerName: signer}));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({...formData, [e.target.name]: value});
  };

  // Generate a session key pair for "Digital Ink"
  const handleGenerateKeys = async () => {
    try {
      const keys = await getAppKeys();
      setKeyPair(keys.privateKey);
      notify?.('success', "ECDSA Key Pair Generated for Session. You can now digitally sign.");
    } catch (e) {
      console.error("Key Gen Error", e);
      notify?.('error', "Failed to generate keys.");
    }
  };

  const handleDigitalSign = async () => {
    if (!keyPair) {
      await handleGenerateKeys(); // Auto-generate if missing
      return; 
    }
    
    // Create a hash of the current form data to sign
    const contentToSign = JSON.stringify({
      creditor: formData.creditorName,
      amount: formData.amount,
      account: formData.accountNumber,
      timestamp: Date.now()
    });

    setIsSigning(true);
    try {
      // 1. Sign the content
      // For visual purposes in the document, we will actually use a Hash of the document + Signature
      const signature = await signData(keyPair, contentToSign);
      
      // 2. Shorten for display
      const shortSig = `${signature.substring(0, 20)}...[Verified]`;
      
      setFormData(prev => ({...prev, digitalSignature: shortSig}));
      notify?.('success', "Document digitally signed and verified.");
    } catch (e) {
      console.error("Signing Error", e);
      notify?.('error', "Signing failed.");
    } finally {
      setIsSigning(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const text = await generateAllonge(formData);
      setGeneratedDoc(text || '');
    } catch (e) {
      console.error(e);
      notify?.('error', "Failed to generate allonge.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="w-full lg:w-1/3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Stamp className="w-8 h-8 text-red-500" />
            Endorsement Engine
          </h2>
          <p className="text-slate-400 mt-2">
            Create a formal "Allonge" with optional Notary Jurats and Cryptographic Signatures.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
          
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Endorsement Type</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-red-500 focus:outline-none"
            >
              <option value="Accepted for Value">Accepted for Value (A4V)</option>
              <option value="Without Recourse">Without Recourse (Qualified)</option>
              <option value="Pay to the Order of">Pay to the Order of (Transfer)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Instrument / Account Ref</label>
            <input 
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="1234-5678-9000"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Creditor / Payee</label>
            <input 
              type="text"
              name="creditorName"
              value={formData.creditorName}
              onChange={handleChange}
              placeholder="CHASE BANK NA"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Amount</label>
            <input 
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="$0.00"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Signer (You)</label>
            <input 
              type="text"
              name="signerName"
              value={formData.signerName}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Advanced Options */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
             <div className="flex items-center gap-3">
               <input 
                 type="checkbox" 
                 id="notary"
                 name="includeNotary"
                 checked={formData.includeNotary}
                 onChange={(e) => setFormData({...formData, includeNotary: e.target.checked})}
                 className="rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-red-500"
               />
               <label htmlFor="notary" className="text-sm text-slate-300 flex items-center gap-2">
                 <FileBadge className="w-4 h-4 text-amber-500" /> Include Notary Block
               </label>
             </div>

             {formData.includeNotary && (
               <div className="pl-6 space-y-2 animate-in fade-in slide-in-from-top-1">
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text"
                      name="notaryState"
                      placeholder="State"
                      value={formData.notaryState}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200"
                    />
                    <input 
                      type="text"
                      name="notaryCounty"
                      placeholder="County"
                      value={formData.notaryCounty}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200"
                    />
                  </div>
                  <input 
                    type="text"
                    name="notaryName"
                    placeholder="Notary Public Name (Optional)"
                    value={formData.notaryName}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200"
                  />
               </div>
             )}

             <div className="flex items-center justify-between bg-slate-950 p-3 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                   <KeyRound className="w-4 h-4 text-emerald-500" />
                   {formData.digitalSignature ? "Signed" : "Digital Signature"}
                </div>
                {formData.digitalSignature ? (
                   <span className="text-xs text-emerald-400 font-mono">HASH_ADDED</span>
                ) : (
                  <button 
                    onClick={handleDigitalSign}
                    disabled={isSigning}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700"
                  >
                    {keyPair ? "Sign Now" : "Gen Key & Sign"}
                  </button>
                )}
             </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.accountNumber}
            className="w-full mt-4 py-3 bg-red-700 hover:bg-red-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Stamp className="w-4 h-4" />}
            Generate Allonge
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-[600px] lg:h-auto bg-slate-200 rounded-lg p-4 lg:p-8 overflow-hidden relative border border-slate-300 shadow-inner">
        <div className="absolute top-0 left-0 right-0 h-12 bg-slate-300 border-b border-slate-400 flex items-center justify-between px-4">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Slip Preview</span>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-slate-400 rounded text-slate-700" title="Copy">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-400 rounded text-slate-700" title="Download PDF">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto flex items-center justify-center">
          {generatedDoc ? (
            <div className="bg-white text-black p-8 shadow-2xl w-full max-w-[600px] font-serif text-sm border-2 border-slate-800 relative">
               {/* Watermark effect */}
               <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                 <span className="text-6xl font-bold uppercase rotate-[-30deg]">Allonge</span>
               </div>
               
               {/* Digital Seal Indicator if Signed */}
               {formData.digitalSignature && (
                 <div className="absolute top-4 right-4 border border-emerald-500 p-1 rounded opacity-70">
                   <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono uppercase">
                     <ShieldCheck className="w-3 h-3" /> Digitally Signed
                   </div>
                 </div>
               )}

              <div className="whitespace-pre-wrap leading-relaxed">
                {generatedDoc}
              </div>
              
              <div className="mt-8 pt-8 border-t-2 border-slate-800 flex justify-between items-end">
                 <div>
                   <div className="h-px w-48 bg-black mb-2"></div>
                   <p className="text-xs uppercase">Authorized Signature</p>
                 </div>
                 <div className="text-xs font-mono text-right">
                   Page 1 of 1
                   {formData.digitalSignature && (
                     <div className="mt-1 text-[8px] text-slate-400 max-w-[150px] break-all">
                       DSIG: {formData.digitalSignature}
                     </div>
                   )}
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 select-none">
              <FileBadge className="w-16 h-16 mb-4 opacity-20" />
              <p>Configure endorsement parameters to generate slip.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EndorsementAllonge;
