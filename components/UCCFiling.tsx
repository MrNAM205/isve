
import React, { useState, useEffect } from 'react';
import { 
  FileKey, 
  BrainCircuit, 
  PenTool, 
  Download, 
  Copy,
  Loader2,
  Info,
  ClipboardCheck,
  Search,
  Globe,
  Database,
  ShieldAlert,
  Gavel
} from 'lucide-react';
import { draftUCC1Statement, generateCustomDocument } from '../services/geminiService';
import { getIdentityProfile } from '../services/storage';
import { RegistryResult } from '../types';

const UCCFiling: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'draft' | 'search' | 'defense'>('draft');
  
  // DRAFTING STATE
  const [formData, setFormData] = useState({
    securedParty: '',
    securedPartyAddress: '',
    debtorName: '',
    debtorAddress: '',
    collateralDescription: ''
  });
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // SEARCH STATE
  const [searchParams, setSearchParams] = useState({
    debtorName: '',
    securedParty: '',
    filingNumber: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RegistryResult[]>([]);

  // DEFENSE STATE
  const [rejectionData, setRejectionData] = useState({
    filingNumber: '',
    rejectionReason: '',
    jurisdiction: ''
  });

  useEffect(() => {
    const profile = getIdentityProfile();
    if (profile) {
      setHasProfile(true);
    }
  }, []);

  const handleAutoFill = () => {
    const profile = getIdentityProfile();
    if (profile) {
      setFormData(prev => ({
        ...prev,
        securedParty: profile.livingName || prev.securedParty,
        securedPartyAddress: profile.mailingAddress || prev.securedPartyAddress,
        debtorName: profile.legalName || prev.debtorName,
        debtorAddress: profile.mailingAddress || prev.debtorAddress
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const text = await draftUCC1Statement(formData);
      setGeneratedDoc(text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDefense = async () => {
    setIsGenerating(true);
    try {
      const system = "You are a commercial law attorney specializing in administrative appeals. Draft a formal response to a Filing Officer's rejection notice.";
      const prompt = `Draft a formal Demand for Filing and Administrative Appeal.
      
      Context: A UCC-1 Financing Statement was rejected.
      Jurisdiction: ${rejectionData.jurisdiction}
      Rejection/Flag Reason: ${rejectionData.rejectionReason}
      Filing Ref: ${rejectionData.filingNumber}
      
      Arguments to include:
      1. Citing UCC Article 9-516(b) (or state equivalent) which limits reasons for rejection.
      2. Asserting that the filing office's duty is ministerial, not judicial. They cannot judge the "validity" of collateral, only the format.
      3. Demand the specific written policy or administrative rule relied upon.
      4. Demand immediate acceptance and indexing, effective as of the original presentation date.`;

      const text = await generateCustomDocument(system, prompt);
      setGeneratedDoc(text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegistrySearch = () => {
    if (!searchParams.debtorName && !searchParams.securedParty && !searchParams.filingNumber) return;
    setIsSearching(true);
    setSearchResults([]);

    // Simulate API delay
    setTimeout(() => {
      // Mock Results Logic
      const mockResults: RegistryResult[] = [
        {
          fileNumber: searchParams.filingNumber || `2024-${Math.floor(Math.random() * 1000000)}`,
          debtor: searchParams.debtorName?.toUpperCase() || "JOHN DOE",
          securedParty: searchParams.securedParty || "John: Doe",
          dateFiled: new Date().toLocaleDateString(),
          status: 'Perfected',
          collateralSummary: "All assets, land, and personal property, including fixtures and extracted collateral."
        },
        {
          fileNumber: `2019-${Math.floor(Math.random() * 1000000)}`,
          debtor: searchParams.debtorName?.toUpperCase() || "JOHN DOE",
          securedParty: "UNKNOWN BANK NA",
          dateFiled: "2019-05-12",
          status: 'Lapsed',
          collateralSummary: "2019 Honda Civic VIN# 1HG..."
        }
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileKey className="w-8 h-8 text-blue-500" />
            UCC-1 Commercial Registry
          </h2>
          <p className="text-slate-400 mt-1">
            Draft commercial liens, search the registry, and defend against administrative rejection.
          </p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
           <button 
             onClick={() => setActiveTab('draft')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'draft' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <PenTool className="w-4 h-4" /> Drafter
           </button>
           <button 
             onClick={() => setActiveTab('search')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'search' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <Search className="w-4 h-4" /> Search
           </button>
           <button 
             onClick={() => setActiveTab('defense')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'defense' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <ShieldAlert className="w-4 h-4" /> Rejection Defense
           </button>
        </div>
      </div>

      {activeTab === 'search' ? (
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col">
           <div className="max-w-2xl mx-auto w-full text-center mb-8">
             <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6 text-sm text-blue-300">
                <Globe className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                <p><strong>Note:</strong> This is a simulation for educational purposes. Real UCC searches require specific state portal access.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-left">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Debtor Name</label>
                  <input 
                    type="text"
                    value={searchParams.debtorName}
                    onChange={(e) => setSearchParams({...searchParams, debtorName: e.target.value})}
                    placeholder="e.g. JOHN DOE"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Filing Number</label>
                  <input 
                    type="text"
                    value={searchParams.filingNumber}
                    onChange={(e) => setSearchParams({...searchParams, filingNumber: e.target.value})}
                    placeholder="e.g. 2024-123456"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500 block mb-1">Secured Party</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={searchParams.securedParty}
                      onChange={(e) => setSearchParams({...searchParams, securedParty: e.target.value})}
                      placeholder="e.g. John: Doe"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleRegistrySearch}
                      disabled={isSearching}
                      className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium disabled:opacity-50"
                    >
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                    </button>
                  </div>
                </div>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full space-y-4">
             {searchResults.map((result, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 hover:border-blue-500/30 transition-all animate-in slide-in-from-bottom-2">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-bold text-slate-200">{result.debtor}</h3>
                           <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${result.status === 'Perfected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                             {result.status}
                           </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">File #: {result.fileNumber} • Filed: {result.dateFiled}</p>
                      </div>
                      <div className="text-right">
                         <span className="text-xs text-slate-500 uppercase block">Secured Party</span>
                         <span className="text-sm text-blue-400 font-medium">{result.securedParty}</span>
                      </div>
                   </div>
                   <div className="p-3 bg-slate-900 rounded text-xs text-slate-400">
                      <span className="font-bold text-slate-500 uppercase block mb-1">Collateral Summary</span>
                      {result.collateralSummary}
                   </div>
                </div>
             ))}

             {!isSearching && searchResults.length === 0 && (
               <div className="text-center text-slate-500 mt-12">
                 <p>Perform a search to inspect the registry ledger.</p>
               </div>
             )}
           </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Controls Column */}
          <div className="w-full lg:w-1/3 space-y-6">
            
            {activeTab === 'draft' && (
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 relative overflow-hidden">
                 {isGenerating && (
                   <div className="absolute inset-0 bg-slate-900/90 z-10 flex flex-col items-center justify-center">
                     <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                     <span className="text-blue-400 font-mono text-sm">Thinking (Gemini 3.0 Pro)...</span>
                     <span className="text-slate-500 text-xs mt-1">Defining Collateral Scope</span>
                   </div>
                 )}
                 
                 {hasProfile && !isGenerating && (
                  <button 
                    onClick={handleAutoFill}
                    className="absolute top-6 right-6 text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-900/50 border border-blue-500/20 transition-colors z-20"
                  >
                    <ClipboardCheck className="w-3 h-3" /> Auto-fill
                  </button>
                )}

                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Secured Party (You)</label>
                  <input 
                    type="text"
                    name="securedParty"
                    value={formData.securedParty}
                    onChange={handleChange}
                    placeholder="John Henry: Doe"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Secured Party Address</label>
                  <input 
                    type="text"
                    name="securedPartyAddress"
                    value={formData.securedPartyAddress}
                    onChange={handleChange}
                    placeholder="123 Freedom Blvd"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-800">
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Debtor Name (Strawman)</label>
                  <input 
                    type="text"
                    name="debtorName"
                    value={formData.debtorName}
                    onChange={handleChange}
                    placeholder="JOHN HENRY DOE"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Debtor Address</label>
                  <input 
                    type="text"
                    name="debtorAddress"
                    value={formData.debtorAddress}
                    onChange={handleChange}
                    placeholder="123 Corp St, State, Zip"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Collateral Description</label>
                  <textarea 
                    name="collateralDescription"
                    value={formData.collateralDescription}
                    onChange={handleChange}
                    placeholder="Leave empty for Gemini to draft comprehensive collateral (All assets, personal property, biometric data, etc)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none h-24 resize-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3"/> AI will expand on this description.
                  </p>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.securedParty}
                  className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <BrainCircuit className="w-4 h-4" />
                  Draft Filing (Deep Think)
                </button>
              </div>
            )}

            {activeTab === 'defense' && (
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                 <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-xs text-red-200 mb-2">
                    <span className="font-bold block mb-1">Bureaucracy Navigator:</span>
                    If your filing was rejected as "frivolous" or for "invalid collateral", use this to demand the specific legal authority for that determination.
                 </div>

                 <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Jurisdiction / State</label>
                  <input 
                    type="text"
                    value={rejectionData.jurisdiction}
                    onChange={e => setRejectionData({...rejectionData, jurisdiction: e.target.value})}
                    placeholder="State of..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-red-500 focus:outline-none"
                  />
                 </div>
                 <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Rejection Reason Given</label>
                  <input 
                    type="text"
                    value={rejectionData.rejectionReason}
                    onChange={e => setRejectionData({...rejectionData, rejectionReason: e.target.value})}
                    placeholder="e.g. 'Frivolous Filing' or 'Invalid Debtor'"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-red-500 focus:outline-none"
                  />
                 </div>
                 <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Filing Ref Number</label>
                  <input 
                    type="text"
                    value={rejectionData.filingNumber}
                    onChange={e => setRejectionData({...rejectionData, filingNumber: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-red-500 focus:outline-none"
                  />
                 </div>

                 <button
                  onClick={handleGenerateDefense}
                  disabled={isGenerating || !rejectionData.jurisdiction}
                  className="w-full mt-4 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Gavel className="w-4 h-4" />}
                  Generate Administrative Appeal
                </button>
              </div>
            )}

          </div>

          <div className="flex-1 flex flex-col h-[600px] lg:h-auto bg-slate-900/50 rounded-lg p-4 lg:p-8 overflow-hidden relative border border-slate-800">
            <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {activeTab === 'defense' ? 'Appeal Letter Preview' : 'UCC-1 Preview'}
              </span>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400" title="Download PDF">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 flex-1 overflow-y-auto relative">
              {generatedDoc ? (
                <div className="relative w-full max-w-[800px] mx-auto">
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <span className="text-7xl md:text-8xl lg:text-9xl font-black text-red-500/10 transform -rotate-15 select-none">
                      FOR EDUCATIONAL PURPOSES ONLY
                    </span>
                  </div>
                  <div className="bg-white text-black p-12 shadow-2xl min-h-[800px] w-full font-serif text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-200 selection:text-black">
                    {generatedDoc}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 select-none">
                  <FileKey className="w-16 h-16 mb-4 opacity-20" />
                  <p>
                    {activeTab === 'defense' ? 'Generate a formal response to filing rejection.' : 'Draft your financing statement to perfect your security interest.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UCCFiling;
