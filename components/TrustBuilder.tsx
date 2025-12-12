
import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  PenTool, 
  Download, 
  Copy, 
  Loader2, 
  ClipboardCheck,
  FileBadge,
  ArrowRightLeft,
  CheckSquare,
  BadgeDollarSign,
  ScrollText,
  AlertTriangle,
  Gavel,
  Plus
} from 'lucide-react';
import { generateTrustIndenture, generateAssetAssignment, generateSovereignNote } from '../services/geminiService';
import { getIdentityProfile, getDocumentsFromVault } from '../services/storage';

interface TrustBuilderProps {
  notify?: (type: 'success'|'error'|'info', msg: string) => void;
}

const TrustBuilder: React.FC<TrustBuilderProps> = ({ notify }) => {
  const [activeTab, setActiveTab] = useState<'indenture' | 'funding' | 'auth' | 'banking'>('indenture');
  
  // Indenture State
  const [trustData, setTrustData] = useState({
    trustName: '',
    trustType: 'Private Express',
    grantor: '',
    trustee: '',
    beneficiary: '',
    situs: '',
    dateCreated: new Date().toLocaleDateString()
  });

  // Funding State
  const [fundingData, setFundingData] = useState({
    grantor: '',
    trustName: '',
    trustee: '',
    assetDescription: '',
    bondNumber: '',
    includeCopyright: false,
    feeSchedule: ''
  });

  // Banking State
  const [noteData, setNoteData] = useState({
    trustName: '',
    trustee: '',
    payee: '',
    amount: '',
    currency: 'USD',
    maturityDate: '',
    jurisdiction: ''
  });

  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasCopyrightDoc, setHasCopyrightDoc] = useState(false);

  useEffect(() => {
    const profile = getIdentityProfile();
    if (profile) setHasProfile(true);

    // Check Vault for Copyright
    const docs = getDocumentsFromVault();
    // Simple check if any document name or type contains "Copyright"
    const copyrightExists = docs.some(d => 
        d.name.toLowerCase().includes('copyright') || 
        d.type.toLowerCase().includes('copyright') ||
        (d.metadata && d.metadata.documentType === 'Copyright')
    );
    setHasCopyrightDoc(copyrightExists);
  }, []);

  const handleAutoFillIndenture = () => {
    const profile = getIdentityProfile();
    if (profile) {
      setTrustData(prev => ({
        ...prev,
        grantor: profile.livingName || prev.grantor,
        trustee: profile.livingName || prev.trustee, // Usually Self-Trustee initially
        beneficiary: profile.livingName || prev.beneficiary,
        situs: profile.mailingAddress || prev.situs
      }));
    }
  };

  const handleAutoFillFunding = () => {
    const profile = getIdentityProfile();
    if (profile) {
      setFundingData(prev => ({
        ...prev,
        grantor: profile.livingName || prev.grantor,
        trustName: trustData.trustName || prev.trustName,
        trustee: trustData.trustee || prev.trustee,
        bondNumber: profile.taxId || '', // Often BC# or SSN is used here as bond ref
        assetDescription: `1. Original Certificate of Live Birth (Bond) Registration No. ${profile.taxId || '[ID]'}.\n2. Common Law Copyright/Trade Name "${profile.legalName}".\n3. All present and future property attached to the entity ${profile.legalName}.`,
        feeSchedule: "$500,000.00 USD per unauthorized use of Trade Name.\n$100,000.00 USD per minute of unlawful detainment/roadside stop."
      }));
    }
  };

  const handleAddFee = (text: string) => {
    setFundingData(prev => ({
      ...prev,
      feeSchedule: prev.feeSchedule ? `${prev.feeSchedule}\n${text}` : text
    }));
  };

  const handleAutoFillNote = () => {
     const profile = getIdentityProfile();
     if (profile) {
       setNoteData(prev => ({
         ...prev,
         trustName: trustData.trustName || prev.trustName,
         trustee: profile.livingName || prev.trustee,
         jurisdiction: profile.mailingAddress || prev.jurisdiction
       }));
     }
  };

  const handleGenerateIndenture = async () => {
    setIsGenerating(true);
    try {
      const text = await generateTrustIndenture(trustData);
      setGeneratedDoc(text || '');
      notify?.('success', 'Trust Indenture Drafted.');
    } catch (e) {
      console.error(e);
      notify?.('error', 'Drafting failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFunding = async () => {
    setIsGenerating(true);
    try {
      const text = await generateAssetAssignment(fundingData);
      setGeneratedDoc(text || '');
      notify?.('success', 'Asset Assignment Drafted.');
    } catch (e) {
      console.error(e);
      notify?.('error', 'Drafting failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNote = async () => {
    setIsGenerating(true);
    try {
      const text = await generateSovereignNote(noteData);
      setGeneratedDoc(text || '');
      notify?.('success', 'Promissory Note Drafted.');
    } catch (e) {
      console.error(e);
      notify?.('error', 'Drafting failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Landmark className="w-8 h-8 text-amber-500" />
            Estate Structure & Trust
          </h2>
          <p className="text-slate-400 mt-1">
            Build the Private Trust vessel and fund it with your authenticated assets.
          </p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
           <button 
             onClick={() => setActiveTab('indenture')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'indenture' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <PenTool className="w-4 h-4" /> Indenture
           </button>
           <button 
             onClick={() => setActiveTab('funding')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'funding' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <ArrowRightLeft className="w-4 h-4" /> Funding
           </button>
           <button 
             onClick={() => setActiveTab('auth')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'auth' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <FileBadge className="w-4 h-4" /> Auth
           </button>
           <button 
             onClick={() => setActiveTab('banking')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'banking' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <BadgeDollarSign className="w-4 h-4" /> Private Banking
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Controls Column */}
        <div className="w-full lg:w-1/3 space-y-6">
          
          {/* INDENTURE FORM */}
          {activeTab === 'indenture' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 relative">
              {hasProfile && (
                <button 
                  onClick={handleAutoFillIndenture}
                  className="absolute top-6 right-6 text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-amber-900/50 border border-amber-500/20 transition-colors"
                >
                  <ClipboardCheck className="w-3 h-3" /> Auto-fill
                </button>
              )}
              
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Trust Structure</h3>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Trust Name</label>
                <input 
                  type="text"
                  value={trustData.trustName}
                  onChange={e => setTrustData({...trustData, trustName: e.target.value})}
                  placeholder="The John Doe Revocable Trust"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Grantor (Settlor)</label>
                <input 
                  type="text"
                  value={trustData.grantor}
                  onChange={e => setTrustData({...trustData, grantor: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Trustee</label>
                <input 
                  type="text"
                  value={trustData.trustee}
                  onChange={e => setTrustData({...trustData, trustee: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Beneficiary</label>
                <input 
                  type="text"
                  value={trustData.beneficiary}
                  onChange={e => setTrustData({...trustData, beneficiary: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleGenerateIndenture}
                disabled={isGenerating || !trustData.trustName}
                className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <PenTool className="w-4 h-4" />}
                Draft Indenture (98 Series)
              </button>
            </div>
          )}

          {/* FUNDING FORM */}
          {activeTab === 'funding' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 relative">
              {hasProfile && (
                <button 
                  onClick={handleAutoFillFunding}
                  className="absolute top-6 right-6 text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-amber-900/50 border border-amber-500/20 transition-colors"
                >
                  <ClipboardCheck className="w-3 h-3" /> Auto-fill
                </button>
              )}
              
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Asset Transfer</h3>
              <p className="text-xs text-slate-400 mb-2">Transfer the Authenticated Birth Certificate (Bond) and Trade Name into the Trust.</p>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Grantor (You)</label>
                <input 
                  type="text"
                  value={fundingData.grantor}
                  onChange={e => setFundingData({...fundingData, grantor: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Trust Name (Recipient)</label>
                <input 
                  type="text"
                  value={fundingData.trustName}
                  onChange={e => setFundingData({...fundingData, trustName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Asset Description</label>
                <textarea 
                  value={fundingData.assetDescription}
                  onChange={e => setFundingData({...fundingData, assetDescription: e.target.value})}
                  placeholder="Describe the BC, Copyright, and other assets..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none h-24 resize-none text-sm"
                />
              </div>

              {/* Copyright Attachment Logic */}
              <div className="pt-2">
                 <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="checkbox"
                      id="attachCopyright"
                      checked={fundingData.includeCopyright}
                      onChange={e => setFundingData({...fundingData, includeCopyright: e.target.checked})}
                      className="rounded bg-slate-950 border-slate-700 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="attachCopyright" className={`text-sm ${fundingData.includeCopyright ? 'text-amber-400' : 'text-slate-400'} flex items-center gap-2 font-medium`}>
                       Attach Copyright Notice (Exhibit A)
                    </label>
                 </div>
                 
                 {fundingData.includeCopyright && (
                   <div className="bg-slate-950 p-3 rounded border border-amber-500/20 animate-in slide-in-from-top-2">
                      <label className="block text-xs font-mono text-amber-500 uppercase mb-2 flex items-center gap-1">
                        <Gavel className="w-3 h-3" /> Fee Schedule & Penalties
                      </label>
                      <textarea 
                        value={fundingData.feeSchedule}
                        onChange={e => setFundingData({...fundingData, feeSchedule: e.target.value})}
                        placeholder="$500,000.00 for unauthorized use..."
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none h-24 resize-none text-xs font-mono mb-2"
                      />
                      <div className="flex flex-wrap gap-2">
                         <button onClick={() => handleAddFee('$1,000,000.00 for Handcuffs/Restraints')} className="px-2 py-1 bg-slate-800 text-[10px] rounded text-slate-400 hover:text-white border border-slate-700 flex items-center gap-1"><Plus className="w-3 h-3"/> Handcuffs</button>
                         <button onClick={() => handleAddFee('$100,000.00 per minute of Unlawful Detainment')} className="px-2 py-1 bg-slate-800 text-[10px] rounded text-slate-400 hover:text-white border border-slate-700 flex items-center gap-1"><Plus className="w-3 h-3"/> Detainment</button>
                         <button onClick={() => handleAddFee('$250,000.00 for Coercion to Contract')} className="px-2 py-1 bg-slate-800 text-[10px] rounded text-slate-400 hover:text-white border border-slate-700 flex items-center gap-1"><Plus className="w-3 h-3"/> Coercion</button>
                         <button onClick={() => handleAddFee('$50,000.00 for Traffic Stop without Injured Party')} className="px-2 py-1 bg-slate-800 text-[10px] rounded text-slate-400 hover:text-white border border-slate-700 flex items-center gap-1"><Plus className="w-3 h-3"/> Traffic Stop</button>
                      </div>
                   </div>
                 )}
              </div>

              <button
                onClick={handleGenerateFunding}
                disabled={isGenerating || !fundingData.trustName}
                className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <ArrowRightLeft className="w-4 h-4" />}
                Draft Assignment of Title
              </button>
            </div>
          )}

          {/* AUTH TRACKER */}
          {activeTab === 'auth' && (
             <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">BC Authentication Steps</h3>
                
                <div className="space-y-4">
                  <AuthStep step={1} title="Order Certified Copy" desc="Obtain long-form BC from Vital Statistics." />
                  <AuthStep step={2} title="State Authentication" desc="Send to Secretary of State for certification." />
                  <AuthStep step={3} title="Federal Authentication" desc="Send State-certified copy to US Dept of State (DS-4194)." />
                  <AuthStep step={4} title="Foreign Apostille" desc="(Optional) Hague convention apostille if moving to foreign situs." />
                </div>

                <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded text-xs text-amber-200">
                   <strong>Note:</strong> Only after Step 3 (Federal Auth) is the Birth Certificate considered a fully authenticated "Foreign" document suitable for deposit into a 98-Series Trust.
                </div>
             </div>
          )}

          {/* PRIVATE BANKING */}
          {activeTab === 'banking' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 relative">
              {hasProfile && (
                <button 
                  onClick={handleAutoFillNote}
                  className="absolute top-6 right-6 text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-amber-900/50 border border-amber-500/20 transition-colors"
                >
                  <ClipboardCheck className="w-3 h-3" /> Auto-fill
                </button>
              )}
              
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                 <BadgeDollarSign className="w-4 h-4 text-emerald-500" /> Sovereign Finance
              </h3>
              
              <div className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded text-xs text-emerald-200 mb-2">
                 Generate UNCITRAL-compliant International Promissory Notes to discharge obligations using the Trust's credit.
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Issuer (Trust)</label>
                <input 
                  type="text"
                  value={noteData.trustName}
                  onChange={e => setNoteData({...noteData, trustName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Payee (Creditor)</label>
                <input 
                  type="text"
                  value={noteData.payee}
                  onChange={e => setNoteData({...noteData, payee: e.target.value})}
                  placeholder="e.g. IRS, CHASE BANK"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Amount</label>
                    <input 
                      type="text"
                      value={noteData.amount}
                      onChange={e => setNoteData({...noteData, amount: e.target.value})}
                      placeholder="1,000,000.00"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                 </div>
                 <div className="w-24">
                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Currency</label>
                    <input 
                      type="text"
                      value={noteData.currency}
                      onChange={e => setNoteData({...noteData, currency: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                 </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Maturity Date</label>
                <input 
                  type="date"
                  value={noteData.maturityDate}
                  onChange={e => setNoteData({...noteData, maturityDate: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleGenerateNote}
                disabled={isGenerating || !noteData.amount}
                className="w-full mt-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <ScrollText className="w-4 h-4" />}
                Draft Promissory Note
              </button>
            </div>
          )}

        </div>

        {/* Preview Column */}
        <div className="flex-1 flex flex-col h-[600px] lg:h-auto bg-slate-100 rounded-lg text-slate-900 p-8 shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 left-0 right-0 h-12 bg-slate-200 border-b border-slate-300 flex items-center justify-between px-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {activeTab === 'indenture' ? 'Trust Indenture Preview' : activeTab === 'funding' ? 'Bill of Sale Preview' : activeTab === 'banking' ? 'Promissory Note' : 'Guide'}
              </span>
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
             {generatedDoc ? (
               <div className={activeTab === 'banking' ? "p-8 border-4 border-double border-slate-800 bg-white" : ""}>
                 {activeTab === 'banking' && (
                   <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
                      <h2 className="text-2xl font-bold uppercase tracking-widest">International Promissory Note</h2>
                      <p className="text-xs font-mono mt-1">UNCITRAL Convention on International Bills of Exchange</p>
                   </div>
                 )}
                 {generatedDoc}
               </div>
             ) : activeTab === 'auth' ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none">
                   <FileBadge className="w-16 h-16 mb-4 opacity-20" />
                   <p>Follow the checklist on the left to authenticate your Bond.</p>
                </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none">
                 <Landmark className="w-16 h-16 mb-4 opacity-20" />
                 <p>Configure the parameters to generate your estate documents.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

const AuthStep: React.FC<{step: number, title: string, desc: string}> = ({step, title, desc}) => (
  <div className="flex items-start gap-3">
     <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex-shrink-0 border border-slate-700">
       {step}
     </div>
     <div>
       <h4 className="text-sm font-medium text-slate-200">{title}</h4>
       <p className="text-xs text-slate-500 mt-1">{desc}</p>
     </div>
     <div className="ml-auto">
        <input type="checkbox" className="rounded bg-slate-950 border-slate-700 text-amber-600 focus:ring-amber-500" />
     </div>
  </div>
);

export default TrustBuilder;
