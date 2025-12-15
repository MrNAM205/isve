
import React, { useState, useRef } from 'react';
import { 
  AlertTriangle,
  Upload,
  FileText,
  FileImage,
  Loader2,
  ArrowRight,
  AlertOctagon,
  Plus,
  Database,
  FileSearch,
  Scale,
  EyeOff,
  User,
  DollarSign,
  Clock,
  MapPin,
  Scissors,
  Stamp,
  FileSignature,
  Copy,
  Check,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { 
  parseDocumentFromMedia, 
  parseInstrument, 
  analyzeTILAContract, 
  generateCeaseDesist, 
  analyzeCreditReport,
  generateRestrictiveEndorsement,
  generateAccordLetter 
} from '../services/geminiService';
import { InstrumentData, TILAAnalysisResult, FDCPAViolation, CreditReportAnalysis, NotifyFn, DraftDisputeData, CreditDisputeItem } from '../types';
import { saveToClipboard } from '../services/storage';

type Mode = 'standard' | 'tila' | 'credit_report';

const violationOptions = [
  'Calling Outside 8AM-9PM', 
  'Calling Third Parties', 
  'Threats/Harassment', 
  'Failure to Validate Debt (FDCPA 809)', 
  'Misrepresentation of Debt Status'
];

interface InstrumentParserProps {
  notify?: NotifyFn;
  onDraftAllonge?: () => void;
  onDraftDispute?: (data: DraftDisputeData) => void;
}

const InstrumentParser: React.FC<InstrumentParserProps> = ({ notify, onDraftAllonge, onDraftDispute }) => {
  const [mode, setMode] = useState<Mode>('standard');
  const [rawInput, setRawInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Standard Parser State
  const [data, setData] = useState<InstrumentData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Accord & Satisfaction State
  const [accordMode, setAccordMode] = useState(false);
  const [accordInput, setAccordInput] = useState({ instrumentNumber: '', tenderDate: new Date().toISOString().split('T')[0] });
  const [accordDocs, setAccordDocs] = useState<{endorsement: string, letter: string} | null>(null);
  const [isAccordGenerating, setIsAccordGenerating] = useState(false);

  // TILA State
  const [tilaResult, setTilaResult] = useState<TILAAnalysisResult | null>(null);

  // Credit Report State
  const [creditResult, setCreditResult] = useState<CreditReportAnalysis | null>(null);

  // FDCPA State
  const [violations, setViolations] = useState<FDCPAViolation[]>([]);
  const [newViolation, setNewViolation] = useState({ collector: '', type: violationOptions[0], details: '' });
  const [generatedCD, setGeneratedCD] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if(!rawInput && !fileName) return;
    setIsLoading(true);
    setError(null);
    setTilaResult(null);
    setData(null);
    setCreditResult(null);
    setAccordDocs(null); // Reset accord docs on new parse

    try {
      // Text Mode processing
      if (mode === 'standard') {
        const parsedData = await parseInstrument(rawInput);
        if (parsedData) {
           setData(parsedData);
           notify?.('success', 'Instrument parsed successfully.');
        }
      } else if (mode === 'tila') {
        const jsonString = await analyzeTILAContract(rawInput);
        if (jsonString) {
           const cleaned = jsonString.replace(/```json\n/g, '').replace(/\n```/g, '');
           setTilaResult(JSON.parse(cleaned));
           notify?.('success', 'TILA Contract analysis complete.');
        }
      }
    } catch (e) {
      console.error(e);
      const msg = "Processing failed. Check your connection or input format.";
      setError(msg);
      notify?.('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      const msg = "File too large. Please upload a file under 4MB.";
      setError(msg);
      notify?.('error', msg);
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setData(null);
    setTilaResult(null);
    setCreditResult(null);
    setAccordDocs(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      // Extract base64 data (remove data:application/pdf;base64, prefix etc)
      const base64Data = result.split(',')[1];
      const mimeType = file.type || 'application/pdf'; // Fallback if browser doesn't detect

      try {
        if (mode === 'credit_report') {
           const jsonString = await analyzeCreditReport(base64Data, mimeType);
           if (jsonString) {
             const cleaned = jsonString.replace(/```json\n/g, '').replace(/\n```/g, '');
             setCreditResult(JSON.parse(cleaned));
             notify?.('success', 'Credit report scanned successfully.');
           }
        } else {
           // Use the updated generic media parser which handles PDF and Image for Standard/TILA
           const parsed = await parseDocumentFromMedia(base64Data, mimeType);
           
           if (mode === 'tila') {
             // If looking for TILA but using generic parser, adapt it or warn user
             notify?.('info', "TILA Analysis currently supports text paste best. Standard extraction performed.");
             setData(parsed); 
           } else {
             setData(parsed);
             notify?.('success', 'Document parsed successfully.');
           }
        }
      } catch (err) {
        console.error("Error parsing media:", err);
        const msg = "Failed to analyze file. Please ensure it is legible and try again.";
        setError(msg);
        notify?.('error', msg);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      const msg = "Failed to read the file. Please try again.";
      setError(msg);
      notify?.('error', msg);
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const logViolation = () => {
    if (!newViolation.collector) return;
    const v: FDCPAViolation = {
      id: Date.now().toString(),
      debtCollector: newViolation.collector,
      violationType: newViolation.type,
      date: new Date().toLocaleDateString(),
      details: newViolation.details || "No details provided."
    };
    setViolations([v, ...violations]);
    setNewViolation({ collector: '', type: violationOptions[0], details: '' });
    notify?.('info', 'FDCPA Violation logged.');
  };

  const generateCDLetter = async () => {
    if (violations.length === 0) return;
    setIsLoading(true);
    try {
      const text = await generateCeaseDesist({ 
        collector: violations[0].debtCollector, 
        userName: "[Your Name]" 
      }, violations);
      setGeneratedCD(text || "");
      notify?.('success', 'Cease & Desist letter generated.');
    } catch (e) {
      notify?.('error', "Failed to generate C&D letter.");
      setError("Failed to generate C&D letter.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccordGeneration = async () => {
    if (!data) return;
    setIsAccordGenerating(true);
    try {
      const payload = {
        creditorName: data.creditor_name,
        accountNumber: data.account_number,
        amount: data.coupon_amount || data.amount_due,
        instrumentNumber: accordInput.instrumentNumber,
        tenderDate: accordInput.tenderDate
      };
      
      const endorsement = await generateRestrictiveEndorsement(payload);
      const letter = await generateAccordLetter(payload);
      
      setAccordDocs({ endorsement: endorsement || '', letter: letter || '' });
      notify?.('success', 'Accord & Satisfaction documents generated.');
    } catch (e) {
      console.error(e);
      notify?.('error', 'Failed to generate Accord documents.');
    } finally {
      setIsAccordGenerating(false);
    }
  };

  const draftEndorsement = () => {
    if (data && onDraftAllonge) {
      saveToClipboard(data);
      onDraftAllonge();
    }
  };

  const draftDispute = (item: CreditDisputeItem) => {
    if (onDraftDispute) {
       onDraftDispute({
          disputeItem: `Account: ${item.account_number} (${item.creditor}) - Listed as ${item.reason} on ${item.date}. Verification demanded per FCRA 609.`
       });
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">JARVIS Instrument Parser</h2>
          <p className="text-slate-400">
            Digitize financial instruments, upload billing PDFs for coupon analysis, and scan credit reports for dispute.
          </p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setMode('standard')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${mode === 'standard' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Statement & Coupon
          </button>
          <button 
            onClick={() => setMode('credit_report')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${mode === 'credit_report' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Credit Report
          </button>
          <button 
            onClick={() => setMode('tila')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${mode === 'tila' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            TILA Contract
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                {mode === 'standard' ? 'Bill / Coupon Source' : mode === 'credit_report' ? 'Upload Report (PDF)' : 'Contract Text'}
              </h3>
              
              <div className="flex gap-2">
                <button 
                  onClick={triggerFileInput}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 text-xs text-slate-300"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Upload PDF/Img
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {fileName ? (
              <div className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-3 relative">
                 {fileName.endsWith('.pdf') ? <FileText className="w-12 h-12 text-red-500 opacity-70"/> : <FileImage className="w-12 h-12 text-cyan-500 opacity-50" />}
                 <p className="text-sm font-mono">{fileName}</p>
                 {isLoading && <div className="flex items-center gap-2 text-cyan-400 text-xs animate-pulse"><Loader2 className="w-3 h-3 animate-spin"/> AI Scanning Document...</div>}
                 <button 
                  onClick={() => { setFileName(null); setRawInput(''); setError(null); }} 
                  className="text-xs text-red-400 hover:underline absolute bottom-4"
                 >
                   Remove File
                 </button>
              </div>
            ) : (
              <textarea
                className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-300 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none resize-none"
                placeholder={mode === 'standard' ? "Paste the text of the bill or use Upload..." : "Paste text here..."}
                value={rawInput}
                onChange={(e) => { setRawInput(e.target.value); setError(null); }}
              />
            )}

            {!fileName && (
              <button
                onClick={handleProcess}
                disabled={isLoading || !rawInput}
                className="mt-4 w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    {mode === 'standard' ? 'Extract Data' : 'Analyze'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* FDCPA Logger Section (Always visible) */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg">
             <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
               <AlertOctagon className="w-5 h-5 text-orange-500" /> FDCPA Violation Logger
             </h3>
             <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Debt Collector Name"
                  value={newViolation.collector}
                  onChange={e => setNewViolation({...newViolation, collector: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                />
                <select 
                  value={newViolation.type}
                  onChange={e => setNewViolation({...newViolation, type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                >
                   {violationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <textarea 
                   placeholder="Details of violation..."
                   value={newViolation.details}
                   onChange={e => setNewViolation({...newViolation, details: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm h-20 resize-none"
                />
                <button 
                   onClick={logViolation}
                   disabled={!newViolation.collector}
                   className="w-full py-2 bg-orange-600/80 hover:bg-orange-600 text-white rounded text-sm font-medium flex items-center justify-center gap-2"
                >
                   <Plus className="w-4 h-4" /> Log Violation
                </button>
             </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="space-y-6">
          {/* Results Display */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg min-h-[400px] relative">
            <div className="mb-6 flex items-center gap-2">
              {mode === 'standard' ? (
                <Database className="w-5 h-5 text-cyan-400" />
              ) : mode === 'credit_report' ? (
                <FileSearch className="w-5 h-5 text-pink-400" />
              ) : (
                <Scale className="w-5 h-5 text-emerald-400" />
              )}
              <h3 className="text-lg font-medium text-white">
                {mode === 'standard' ? 'Billing Analysis' : mode === 'credit_report' ? 'FCRA Dispute Candidates' : 'TILA Report'}
              </h3>
            </div>

            {!data && !tilaResult && !creditResult && !isLoading && (
               <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                 <p className="text-sm">Waiting for document input...</p>
               </div>
            )}

            {/* CREDIT REPORT RESULTS */}
            {mode === 'credit_report' && creditResult && (
               <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg">
                     <div>
                        <span className="text-xs text-slate-500 uppercase">Bureau</span>
                        <p className="text-lg font-bold text-white">{creditResult.bureau || 'Unknown'}</p>
                     </div>
                     <div className="text-right">
                        <span className="text-xs text-slate-500 uppercase">Score</span>
                        <p className="text-2xl font-bold text-cyan-400">{creditResult.score || 'N/A'}</p>
                     </div>
                  </div>

                  <div>
                     <h4 className="text-sm font-semibold text-pink-400 mb-2 flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4" /> Negative Items (Dispute Candidates)
                     </h4>
                     {creditResult.negative_items && creditResult.negative_items.length > 0 ? (
                        <div className="space-y-2">
                           {creditResult.negative_items.map((item, i) => (
                              <div key={i} className="p-3 bg-pink-500/10 border border-pink-500/20 rounded text-sm group relative">
                                 <div className="flex justify-between font-semibold text-pink-200">
                                    <span>{item.creditor}</span>
                                    <span>{item.date}</span>
                                 </div>
                                 <div className="text-xs text-pink-300 mt-1 flex justify-between">
                                    <span>{item.account_number}</span>
                                    <span>{item.reason}</span>
                                 </div>
                                 <button 
                                   onClick={() => draftDispute(item)}
                                   className="w-full mt-2 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs flex items-center justify-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                                 >
                                   <ShieldAlert className="w-3 h-3" /> Draft 609 Dispute
                                 </button>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-sm text-slate-500 italic">No clear negative items detected.</p>
                     )}
                  </div>

                  <div>
                     <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                        <EyeOff className="w-4 h-4" /> Personal Info Variations
                     </h4>
                     <ul className="list-disc list-inside text-xs text-slate-400">
                        {creditResult.personal_info_errors && creditResult.personal_info_errors.length > 0 ? (
                           creditResult.personal_info_errors.map((err, i) => <li key={i}>{err}</li>)
                        ) : (
                           <li className="list-none">None detected.</li>
                        )}
                     </ul>
                  </div>
               </div>
            )}

            {/* STANDARD RESULTS (BILL/COUPON) */}
            {mode === 'standard' && data && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <DataRow label="Creditor" value={data.creditor_name} icon={<User className="w-4 h-4" />} />
                <DataRow label="Account #" value={data.account_number} icon={<Database className="w-4 h-4" />} />
                
                <div className="grid grid-cols-2 gap-2">
                   <DataRow label="Total Due" value={data.amount_due} icon={<DollarSign className="w-4 h-4" />} highlight />
                   <DataRow label="Due Date" value={data.due_date || data.statement_date} icon={<Clock className="w-4 h-4" />} />
                </div>

                <DataRow label="Payment Address" value={data.remit_address || data.payment_address} icon={<MapPin className="w-4 h-4" />} />
                
                {data.remit_address && data.remit_address !== data.payment_address && (
                    <div className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/20 flex gap-2">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>Dedicated Remit Address detected. Use this for the Allonge.</span>
                    </div>
                )}
                
                {data.is_payment_coupon && (
                  <div className="mt-4 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                     <div className="flex items-center gap-2 text-cyan-400 mb-2">
                        <Scissors className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase">Payment Coupon Detected</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-slate-500">Coupon Amount</span>
                          <p className="font-mono text-slate-200">{data.coupon_amount || data.amount_due}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Action</span>
                          <p className="font-mono text-slate-200">Endorsement Required</p>
                        </div>
                     </div>
                     
                     {/* Action Button for Endorsement */}
                     <button 
                       onClick={draftEndorsement}
                       className="w-full mt-2 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-red-500/20"
                     >
                        <Stamp className="w-4 h-4" />
                        Draft Allonge (Attachment)
                     </button>
                  </div>
                )}

                {/* ACCORD & SATISFACTION WORKFLOW */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => setAccordMode(!accordMode)}
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span className="flex items-center gap-2"><FileSignature className="w-4 h-4"/> Accord & Satisfaction Workflow</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${accordMode ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {accordMode && (
                    <div className="mt-4 space-y-4 bg-slate-950 p-4 rounded-lg border border-indigo-500/20 animate-in slide-in-from-top-2">
                       <p className="text-xs text-slate-400 mb-2">
                         Generate a UCC 3-311 packet to settle the claim via restricted payment.
                       </p>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Check / Instrument #</label>
                            <input 
                              type="text" 
                              value={accordInput.instrumentNumber}
                              onChange={e => setAccordInput({...accordInput, instrumentNumber: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                              placeholder="e.g. 1055"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Tender Date</label>
                            <input 
                              type="date" 
                              value={accordInput.tenderDate}
                              onChange={e => setAccordInput({...accordInput, tenderDate: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                       </div>
                       <button 
                         onClick={handleAccordGeneration}
                         disabled={isAccordGenerating || !accordInput.instrumentNumber}
                         className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                       >
                         {isAccordGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileText className="w-4 h-4"/>}
                         Generate Package
                       </button>

                       {accordDocs && (
                         <div className="space-y-4 mt-4 animate-in fade-in">
                            <div className="p-3 bg-slate-900 rounded border border-slate-700">
                               <div className="flex justify-between items-center mb-2">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Restrictive Endorsement (Back of Check)</span>
                                 <button onClick={() => { navigator.clipboard.writeText(accordDocs.endorsement); notify?.('info', 'Copied'); }} className="text-xs text-indigo-400 hover:text-white" title="Copy"><Copy className="w-3 h-3"/></button>
                               </div>
                               <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{accordDocs.endorsement}</pre>
                            </div>
                            <div className="p-3 bg-slate-900 rounded border border-slate-700">
                               <div className="flex justify-between items-center mb-2">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Cover Letter (UCC 3-311)</span>
                                 <button onClick={() => { navigator.clipboard.writeText(accordDocs.letter); notify?.('info', 'Copied'); }} className="text-xs text-indigo-400 hover:text-white" title="Copy"><Copy className="w-3 h-3"/></button>
                               </div>
                               <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">{accordDocs.letter}</pre>
                            </div>
                         </div>
                       )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800">
                   <h4 className="text-xs font-mono text-slate-500 uppercase mb-3">FDCPA Scan Results</h4>
                   {data.fdcpa_violations && data.fdcpa_violations.length > 0 ? (
                      <ul className="space-y-2">
                        {data.fdcpa_violations.map((v, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-red-300 bg-red-500/10 p-2 rounded">
                            <AlertOctagon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {v}
                          </li>
                        ))}
                      </ul>
                   ) : (
                     <div className="flex items-center gap-2 text-emerald-400 text-sm">
                       <Check className="w-4 h-4" />
                       <span>No obvious violations detected.</span>
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* TILA RESULTS */}
            {mode === 'tila' && tilaResult && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                   <div className={`p-4 rounded-lg border ${tilaResult.aprValid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="text-xs text-slate-400 uppercase mb-1">APR Disclosure</div>
                      <div className={`font-bold ${tilaResult.aprValid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tilaResult.aprValid ? 'COMPLIANT' : 'INVALID'}
                      </div>
                   </div>
                   <div className={`p-4 rounded-lg border ${tilaResult.financeChargeValid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="text-xs text-slate-400 uppercase mb-1">Finance Charge</div>
                      <div className={`font-bold ${tilaResult.financeChargeValid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tilaResult.financeChargeValid ? 'COMPLIANT' : 'INVALID'}
                      </div>
                   </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Hidden Clauses</h4>
                  <ul className="space-y-2">
                    {tilaResult.hiddenFeesFound.map((item, idx) => (
                       <li key={idx} className="text-sm text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                         {item}
                       </li>
                    ))}
                    {tilaResult.hiddenFeesFound.length === 0 && <li className="text-sm text-slate-500">None detected.</li>}
                  </ul>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                    <Scale className="w-4 h-4" /> Remedy Guidance
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {tilaResult.remedyGuidance}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Violation List & Remedy */}
          {violations.length > 0 && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Logged Violations</h3>
                  <button 
                    onClick={generateCDLetter}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Mail className="w-3 h-3" />}
                    Generate C&D Letter
                  </button>
               </div>
               <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
                 {violations.map(v => (
                   <div key={v.id} className="p-2 bg-slate-950 border border-slate-800 rounded text-sm">
                      <div className="flex justify-between text-slate-400 text-xs">
                         <span>{v.date}</span>
                         <span className="text-orange-400">{v.violationType}</span>
                      </div>
                      <div className="font-medium text-slate-200">{v.debtCollector}</div>
                   </div>
                 ))}
               </div>
               
               {generatedCD && (
                 <div className="p-4 bg-slate-950 rounded border border-blue-900 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {generatedCD}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DataRow: React.FC<{label: string, value: string, icon: React.ReactNode, highlight?: boolean}> = ({label, value, icon, highlight}) => (
  <div className={`flex items-center justify-between p-3 rounded-lg border ${highlight ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-slate-950 border-slate-800'}`}>
    <div className="flex items-center gap-3 text-slate-400 text-sm">
      {icon}
      <span>{label}</span>
    </div>
    <span className={`font-mono font-medium text-right text-sm ${highlight ? 'text-cyan-400' : 'text-slate-200'} truncate max-w-[200px]`} title={value}>
      {value || "N/A"}
    </span>
  </div>
);

export default InstrumentParser;
