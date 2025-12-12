
import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  PenTool, 
  Download, 
  Copy,
  Loader2,
  ClipboardCheck,
  Feather,
  FileText,
  AlertTriangle,
  ArrowRight,
  Search,
  BookOpen,
  Phone,
  Landmark,
  Eye,
  Key,
  Eraser,
  XCircle
} from 'lucide-react';
import { generateAffidavit, generateCustomDocument, generateRescissionNotice } from '../services/geminiService';
import { getIdentityProfile } from '../services/storage';

// Icons for Rescission Buttons
const CheckSquareIcon = ({className}:{className:string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);
const CarIcon = ({className}:{className:string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>
);
const DollarIcon = ({className}:{className:string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const FingerprintIcon = ({className}:{className:string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12"/><path d="M12 12c0 3 2.5 5.5 5.5 5.5S23 15 23 12"/><path d="M12 12c-3 0-5.5-2.5-5.5-5.5S9 1 12 1"/><path d="M12 12c-3 0-5.5 2.5-5.5 5.5S9 23 12 23"/></svg>
);

const DISCOVERY_STEPS = [
  {
    id: 1,
    title: "The Origin Record",
    icon: <FileText className="w-5 h-5" />,
    narration: "Identity registration marks the entry into the administrative ledger. The 'Birth Certificate' is the evidentiary receipt of the State's creation of a legal fiction.",
    action: "Acquire the Certified Long-Form Copy from the State of Birth.",
    script: "I am requesting the 'Book and Page' number associated with this file. Does this certified copy include the Registrar's signature and the date of filing?",
    tip: "Do not accept a 'Short Form' or 'Abstract'. You need the original bond instrument created at the county level."
  },
  {
    id: 2,
    title: "The Red Number",
    icon: <Eye className="w-5 h-5" />,
    narration: "The State File Number (often in red ink) serves as the primary tracking identifier for the bonded pledge. It connects the individual record to the pooled futures of the state's revenue forecast.",
    action: "Locate the 6-8 digit number in the upper right or bottom corners.",
    script: null,
    tip: "If the number is black, it may be a copy of a copy. You require the 'Red Ink' number for authentication (DS-4194)."
  },
  {
    id: 3,
    title: "CUSIP Linkage",
    icon: <Key className="w-5 h-5" />,
    narration: "Futures are pooled in statutory trust funds and securitized. While the birth record itself is not traded on a screen, it is part of a block of 'human capital' bonds issued by the State.",
    action: "Reverse engineer the CUSIP using the State's Revenue Bond prefix for your birth year.",
    script: null,
    guide: "1. Find the CUSIP prefix for [Birth State] Revenue Bonds issued in [Birth Year].\n2. The 'State File Number' often correlates to the serial portion of the bond issue.\n3. Search Fidelity or Bloomberg for 'State of [X] General Obligation Bonds'."
  }
];

const RESCISSION_AGENCIES = [
  { name: 'Voter Registration', label: 'Revoke Voter Sig', icon: <CheckSquareIcon className="w-4 h-4"/> },
  { name: 'Department of Motor Vehicles', label: 'Rescind License Sig', icon: <CarIcon className="w-4 h-4"/> },
  { name: 'Internal Revenue Service', label: 'Revoke W-4/1040', icon: <DollarIcon className="w-4 h-4"/> },
  { name: 'Social Security Administration', label: 'Revoke SS-5 App', icon: <FingerprintIcon className="w-4 h-4"/> }
];

const StatusCorrection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'affidavit' | 'records' | 'discovery' | 'rescission'>('discovery');
  const [currentStep, setCurrentStep] = useState(0);
  
  // Affidavit State
  const [formData, setFormData] = useState({
    legalName: '',
    livingName: '',
    dob: '',
    jurisdiction: ''
  });
  const [signerName, setSignerName] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Record Acquisition State
  const [recordState, setRecordState] = useState({
    agencyName: 'Department of Vital Statistics',
    recordType: 'Certified Long-Form Birth Certificate',
    denialReason: '',
    bookNumber: '',
    pageNumber: ''
  });
  const [isResistanceMode, setIsResistanceMode] = useState(false);

  // Rescission State
  const [rescissionData, setRescissionData] = useState({
    agency: '',
    refNumber: '',
    reason: 'Signature obtained without full disclosure of adhesion contract terms.'
  });

  useEffect(() => {
    const profile = getIdentityProfile();
    if (profile && (profile.legalName || profile.livingName)) {
      setHasProfile(true);
    }
  }, []);

  const handleAutoFill = () => {
    const profile = getIdentityProfile();
    if (profile) {
      setFormData(prev => ({
        ...prev,
        legalName: profile.legalName || prev.legalName,
        livingName: profile.livingName || prev.livingName,
        dob: profile.dateOfBirth || prev.dob,
        jurisdiction: prev.jurisdiction 
      }));
      setSignerName(profile.livingName || '');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const text = await generateAffidavit(formData);
      setGeneratedDoc(text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRescission = async () => {
    setIsGenerating(true);
    try {
      const text = await generateRescissionNotice(rescissionData);
      setGeneratedDoc(text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRecordRequest = async () => {
    setIsGenerating(true);
    try {
      let prompt = '';
      let system = '';
      
      if (isResistanceMode) {
        system = 'You are an appellate specialist. Draft a formal demand for statutory authority regarding a denial of records.';
        prompt = `Draft a formal response to a denial from ${recordState.agencyName}. 
        They refused to provide the ${recordState.recordType} or the specific registration/file numbers. 
        Reason given: "${recordState.denialReason || 'Policy/Privacy'}".
        
        Demands:
        1. Cite the specific statute or administrative rule used to deny the request.
        2. Provide the name and title of the Records Custodian making the determination.
        3. Outline the formal administrative appeal process.
        4. Note that "internal policy" does not supersede state statute regarding public records.`;
      } else {
        system = 'You are an administrative law specialist. Draft a precise request for public records.';
        
        const coordinates = recordState.bookNumber || recordState.pageNumber 
          ? `specifically referenced in Book ${recordState.bookNumber || '[Unknown]'}, Page ${recordState.pageNumber || '[Unknown]'}` 
          : '';

        prompt = `Draft a request to ${recordState.agencyName} for the ${recordState.recordType} of ${formData.legalName} (DOB: ${formData.dob}) ${coordinates}.
        
        Critical Inclusions:
        1. Request the "Certified Long-Form" copy.
        2. Explicitly demand the inclusion of the "Registration Number", "State File Number", and any "Local File Numbers".
        ${recordState.bookNumber ? `3. Reference the specific Book ${recordState.bookNumber} and Page ${recordState.pageNumber} to locate the original ledger entry.` : '3. Demand the disclosure of the specific "Book and Page" number where this instrument is recorded.'}
        4. Request any registrar annotations or "red" numbers.
        5. Include a preemptive clause: "If any portion of this record is redacted or withheld (including index numbers), please provide the specific statutory citation authorizing such redaction."`;
      }

      const text = await generateCustomDocument(system, prompt);
      setGeneratedDoc(text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSign = () => {
    if (!generatedDoc || !signerName) return;
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const signatureBlock = `\n\nFURTHER AFFIANT SAYETH NAUGHT.\n\nEXECUTED on this ${date}.\n\nBy: ___________________________________\n    ${signerName}, Authorized Representative\n    All Rights Reserved, Without Prejudice (UCC 1-308)`;
    
    setGeneratedDoc(prev => prev + signatureBlock);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Scale className="w-8 h-8 text-emerald-500" />
            Status Correction & Records
          </h2>
          <p className="text-slate-400 mt-1">
            Rebut corporate presumptions, acquire authenticated records, and rescind implied contracts.
          </p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
           <button 
             onClick={() => setActiveTab('discovery')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'discovery' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <Search className="w-4 h-4" /> Identifier Discovery
           </button>
           <button 
             onClick={() => setActiveTab('affidavit')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'affidavit' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <PenTool className="w-4 h-4" /> Affidavit
           </button>
           <button 
             onClick={() => setActiveTab('records')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'records' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <FileText className="w-4 h-4" /> Record Request
           </button>
           <button 
             onClick={() => setActiveTab('rescission')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'rescission' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <Eraser className="w-4 h-4" /> Rescission Blaster
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        <div className="w-full lg:w-1/3 space-y-6">
          
          {/* DISCOVERY WORKFLOW */}
          {activeTab === 'discovery' && (
            <div className="space-y-6">
               <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl text-sm text-emerald-200">
                  <p className="font-bold mb-1 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Sovereign Thesis</p>
                  Identity artifacts are evidentiary records; they do not function as negotiable instruments on their own. However, they are tracked via identifiers that link to pooled statutory trusts.
               </div>

               <div className="space-y-4">
                  {DISCOVERY_STEPS.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${currentStep === idx ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-900/20' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                    >
                       <div className="flex items-start gap-4 z-10 relative">
                          <div className={`p-2 rounded-lg ${currentStep === idx ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                             {step.icon}
                          </div>
                          <div>
                             <h3 className={`font-bold ${currentStep === idx ? 'text-white' : 'text-slate-400'}`}>{step.title}</h3>
                             <p className="text-xs text-slate-500 mt-1 line-clamp-2">{step.narration}</p>
                          </div>
                       </div>
                       {currentStep === idx && (
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500" />
                       )}
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* AFFIDAVIT FORM */}
          {activeTab === 'affidavit' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 relative">
              {hasProfile && (
                <button 
                  onClick={handleAutoFill}
                  className="absolute top-6 right-6 text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-emerald-900/50 border border-emerald-500/20 transition-colors"
                >
                  <ClipboardCheck className="w-3 h-3" /> Auto-fill
                </button>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Legal Name (ALL CAPS)</label>
                <input 
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  placeholder="JOHN HENRY DOE"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Living Name (Upper & Lower)</label>
                <input 
                  type="text"
                  name="livingName"
                  value={formData.livingName}
                  onChange={handleChange}
                  placeholder="John Henry: of the family Doe"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Date of Birth</label>
                <input 
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Jurisdiction / State</label>
                <input 
                  type="text"
                  name="jurisdiction"
                  value={formData.jurisdiction}
                  onChange={handleChange}
                  placeholder="State of Alabama / Alabama Republic"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.legalName}
                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <PenTool className="w-4 h-4" />}
                Generate Affidavit
              </button>

              {/* Signing Section */}
              {generatedDoc && (
                 <div className="pt-6 mt-6 border-t border-slate-800">
                   <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Signer Name</label>
                   <div className="flex gap-2">
                     <input 
                       type="text"
                       value={signerName}
                       onChange={(e) => setSignerName(e.target.value)}
                       placeholder="Signer Name"
                       className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                     />
                     <button 
                       onClick={handleSign}
                       disabled={!signerName}
                       className="px-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded border border-slate-700 hover:border-emerald-500/50 transition-colors disabled:opacity-50"
                     >
                       <Feather className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
              )}
            </div>
          )}

          {/* RECORDS FORM */}
          {activeTab === 'records' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
               <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg text-xs text-indigo-200 mb-2">
                  <span className="font-bold">Objective:</span> Obtain the "Registration Number", "State File Number", or "Book & Page" coordinates.
               </div>

               {hasProfile && (
                <button 
                  onClick={handleAutoFill}
                  className="text-xs text-indigo-400 flex items-center gap-1 hover:text-white transition-colors mb-2"
                >
                  <ClipboardCheck className="w-3 h-3" /> Auto-fill Subject Data
                </button>
               )}

               <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Target Agency</label>
                <input 
                  type="text"
                  value={recordState.agencyName}
                  onChange={e => setRecordState({...recordState, agencyName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
               </div>
               <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Subject Name</label>
                <input 
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
               </div>
               <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Date of Birth</label>
                <input 
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
               </div>

               {/* New Tracing Inputs */}
               <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800 mt-2">
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Book No.</label>
                    <input 
                      type="text"
                      value={recordState.bookNumber}
                      onChange={e => setRecordState({...recordState, bookNumber: e.target.value})}
                      placeholder="e.g. 145"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-purple-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Page No.</label>
                    <input 
                      type="text"
                      value={recordState.pageNumber}
                      onChange={e => setRecordState({...recordState, pageNumber: e.target.value})}
                      placeholder="e.g. 22"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-purple-500 focus:outline-none text-sm"
                    />
                  </div>
               </div>
               <p className="text-[10px] text-slate-500 mb-2">If left blank, the request will specifically demand these coordinates.</p>

               {/* Resistance Toggle */}
               <div className="pt-2 border-t border-slate-800">
                  <button 
                    onClick={() => setIsResistanceMode(!isResistanceMode)}
                    className={`flex items-center gap-2 text-sm font-bold w-full p-2 rounded transition-colors ${isResistanceMode ? 'bg-red-500/20 text-red-400' : 'hover:bg-slate-800 text-slate-400'}`}
                  >
                     <AlertTriangle className="w-4 h-4" />
                     {isResistanceMode ? 'Resistance Mode: Active' : 'Enable Resistance Mode'}
                  </button>
                  
                  {isResistanceMode && (
                    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                       <p className="text-xs text-slate-400">Use when the agency says "That number doesn't exist" or "We can't release that."</p>
                       <textarea 
                         placeholder="What was their excuse? (e.g. 'Policy prohibits release', 'Not public info')"
                         value={recordState.denialReason}
                         onChange={e => setRecordState({...recordState, denialReason: e.target.value})}
                         className="w-full bg-slate-950 border border-red-900/50 rounded p-2 text-slate-200 text-xs h-20 resize-none focus:border-red-500 focus:outline-none"
                       />
                    </div>
                  )}
               </div>

               <button
                onClick={handleGenerateRecordRequest}
                disabled={isGenerating || !formData.legalName}
                className={`w-full mt-4 py-3 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${isResistanceMode ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : (isResistanceMode ? <AlertTriangle className="w-4 h-4" /> : <FileText className="w-4 h-4" />)}
                {isResistanceMode ? 'Generate Demand for Authority' : 'Generate Precise Request'}
              </button>
            </div>
          )}

          {/* RESCISSION BLASTER FORM */}
          {activeTab === 'rescission' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Automated Rescission</h3>
               
               <div className="grid grid-cols-2 gap-2 mb-4">
                  {RESCISSION_AGENCIES.map(agency => (
                    <button
                      key={agency.name}
                      onClick={() => setRescissionData({...rescissionData, agency: agency.name})}
                      className={`p-3 rounded text-left border text-xs font-medium transition-colors ${rescissionData.agency === agency.name ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'}`}
                    >
                       <div className="flex items-center gap-2 mb-1">
                          {agency.icon} {agency.label}
                       </div>
                    </button>
                  ))}
               </div>

               <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Target Agency</label>
                <input 
                  type="text"
                  value={rescissionData.agency}
                  onChange={e => setRescissionData({...rescissionData, agency: e.target.value})}
                  placeholder="e.g. Department of Motor Vehicles"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
               </div>
               <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Account / File Ref</label>
                <input 
                  type="text"
                  value={rescissionData.refNumber}
                  onChange={e => setRescissionData({...rescissionData, refNumber: e.target.value})}
                  placeholder="e.g. License Number or SSN"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
               </div>
               <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Reason for Rescission</label>
                <textarea 
                  value={rescissionData.reason}
                  onChange={e => setRescissionData({...rescissionData, reason: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-emerald-500 focus:outline-none h-20 resize-none text-sm"
                />
               </div>

               <button
                onClick={handleGenerateRescission}
                disabled={isGenerating || !rescissionData.agency}
                className="w-full mt-4 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Eraser className="w-4 h-4" />}
                Generate Notice of Rescission
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - DYNAMIC CONTENT */}
        <div className="flex-1 flex flex-col h-[600px] lg:h-auto bg-slate-900/50 rounded-lg p-4 lg:p-8 overflow-hidden relative border border-slate-800">
          
          {activeTab === 'discovery' ? (
             <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-4 bg-emerald-500/20 rounded-full border border-emerald-500/50">
                      {DISCOVERY_STEPS[currentStep].icon}
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-white">{DISCOVERY_STEPS[currentStep].title}</h2>
                      <p className="text-emerald-400 font-mono text-sm uppercase">Phase {currentStep + 1} of 3</p>
                   </div>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto">
                   <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Ceremonial Narration</h3>
                      <p className="text-lg font-serif text-slate-200 leading-relaxed italic">
                        "{DISCOVERY_STEPS[currentStep].narration}"
                      </p>
                   </div>

                   <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Required Action</h3>
                      <p className="text-white text-md font-medium mb-4">{DISCOVERY_STEPS[currentStep].action}</p>
                      
                      {DISCOVERY_STEPS[currentStep].script && (
                        <div className="bg-slate-950 p-4 rounded border-l-4 border-indigo-500">
                           <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold uppercase">
                              <Phone className="w-3 h-3" /> Call Script
                           </div>
                           <p className="text-slate-300 font-mono text-sm">"{DISCOVERY_STEPS[currentStep].script}"</p>
                        </div>
                      )}

                      {DISCOVERY_STEPS[currentStep].guide && (
                        <div className="bg-slate-950 p-4 rounded border-l-4 border-amber-500">
                           <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-bold uppercase">
                              <Landmark className="w-3 h-3" /> Research Protocol
                           </div>
                           <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap">{DISCOVERY_STEPS[currentStep].guide}</pre>
                        </div>
                      )}
                   </div>

                   <div className="flex items-start gap-3 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div>
                         <span className="font-bold text-blue-400 text-sm block mb-1">Pro Tip</span>
                         <p className="text-sm text-slate-400">{DISCOVERY_STEPS[currentStep].tip}</p>
                      </div>
                   </div>
                </div>

                <div className="mt-6 flex justify-between">
                   <button 
                     onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                     disabled={currentStep === 0}
                     className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30"
                   >
                     Previous
                   </button>
                   <button 
                     onClick={() => setCurrentStep(Math.min(DISCOVERY_STEPS.length - 1, currentStep + 1))}
                     disabled={currentStep === DISCOVERY_STEPS.length - 1}
                     className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center gap-2 disabled:opacity-30"
                   >
                     Next Phase <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
          ) : (
            <>
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
                  <div className="bg-white text-black p-12 shadow-2xl min-h-[800px] w-full max-w-[800px] mx-auto font-serif text-sm leading-relaxed whitespace-pre-wrap selection:bg-emerald-200 selection:text-black">
                    {generatedDoc}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 select-none">
                    <Scale className="w-16 h-16 mb-4 opacity-20" />
                    <p>{activeTab === 'affidavit' ? 'Generate Affidavit of Status.' : activeTab === 'records' ? 'Draft a precise Records Request.' : 'Select an agency to rescind signature.'}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusCorrection;
