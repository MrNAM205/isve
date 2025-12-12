
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Loader2, 
  Plus, 
  Trash2,
  DollarSign,
  Gavel,
  Calendar,
  Copy,
  Download
} from 'lucide-react';
import { RemedyProcess, CommercialInvoice, NotifyFn } from '../types';
import { getRemedyProcesses, saveRemedyProcess, deleteRemedyProcess, getInvoices, saveInvoice } from '../services/storage';
import { generateAdminNotice, generateInvoice } from '../services/geminiService';

interface RemedyTrackerProps {
  notify?: NotifyFn;
}

const RemedyTracker: React.FC<RemedyTrackerProps> = ({ notify }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'fees'>('admin');
  
  // --- ADMIN PROCESS STATE ---
  const [processes, setProcesses] = useState<RemedyProcess[]>([]);
  const [newProcess, setNewProcess] = useState({ respondent: '', subject: '' });
  const [selectedProcess, setSelectedProcess] = useState<RemedyProcess | null>(null);
  const [generatedNotice, setGeneratedNotice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // --- FEE ENFORCER STATE ---
  const [invoices, setInvoices] = useState<CommercialInvoice[]>([]);
  const [newInvoice, setNewInvoice] = useState({ violator: '', violationType: 'Trespass', amount: '5000.00' });
  const [generatedInvoiceDoc, setGeneratedInvoiceDoc] = useState('');

  useEffect(() => {
    setProcesses(getRemedyProcesses());
    setInvoices(getInvoices());
  }, []);

  // --- ADMIN HANDLERS ---

  const handleCreateProcess = () => {
    if (!newProcess.respondent) return;
    const process: RemedyProcess = {
      id: crypto.randomUUID(),
      respondent: newProcess.respondent,
      subject: newProcess.subject,
      startDate: new Date().toISOString(),
      status: 'Step 1: Inquiry',
      nextActionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      certifiedMailNumbers: []
    };
    saveRemedyProcess(process);
    setProcesses(getRemedyProcesses());
    setNewProcess({ respondent: '', subject: '' });
    notify?.('success', 'Remedy Process Started.');
  };

  const handleDeleteProcess = (id: string) => {
    deleteRemedyProcess(id);
    setProcesses(getRemedyProcesses());
    if (selectedProcess?.id === id) setSelectedProcess(null);
  };

  const handleGenerateNotice = async () => {
    if (!selectedProcess) return;
    setIsGenerating(true);
    try {
      const text = await generateAdminNotice(selectedProcess.status as any, {
        respondent: selectedProcess.respondent,
        subject: selectedProcess.subject,
        sender: "[Your Name]",
        previousDate: new Date(selectedProcess.startDate).toLocaleDateString()
      });
      setGeneratedNotice(text || '');
    } catch (e) {
      notify?.('error', 'Failed to generate notice.');
    } finally {
      setIsGenerating(false);
    }
  };

  const advanceStep = () => {
    if (!selectedProcess) return;
    let nextStatus: RemedyProcess['status'] = selectedProcess.status;
    
    if (selectedProcess.status === 'Step 1: Inquiry') nextStatus = 'Step 2: Fault';
    else if (selectedProcess.status === 'Step 2: Fault') nextStatus = 'Step 3: Default';
    else if (selectedProcess.status === 'Step 3: Default') nextStatus = 'Complete';

    const updated = {
      ...selectedProcess,
      status: nextStatus,
      nextActionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    saveRemedyProcess(updated);
    setProcesses(getRemedyProcesses());
    setSelectedProcess(updated);
    notify?.('success', 'Process advanced to next stage.');
  };

  // --- FEE HANDLERS ---

  const handleCreateInvoice = async () => {
    if (!newInvoice.violator) return;
    setIsGenerating(true);
    try {
      // 1. Generate Doc
      const invNum = `INV-${Date.now().toString().slice(-6)}`;
      const text = await generateInvoice({
        violator: newInvoice.violator,
        sender: "[Your Name]",
        invoiceNumber: invNum,
        date: new Date().toLocaleDateString(),
        violationType: newInvoice.violationType,
        amount: newInvoice.amount
      });
      setGeneratedInvoiceDoc(text || '');

      // 2. Save Record
      const inv: CommercialInvoice = {
        id: crypto.randomUUID(),
        violator: newInvoice.violator,
        violationType: newInvoice.violationType,
        amount: newInvoice.amount,
        date: new Date().toISOString(),
        invoiceNumber: invNum,
        status: 'Sent'
      };
      saveInvoice(inv);
      setInvoices(getInvoices());
      notify?.('success', 'Invoice Generated & Logged.');
    } catch (e) {
      notify?.('error', 'Failed to generate invoice.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-500" />
            Remedy Tracker
          </h2>
          <p className="text-slate-400 mt-2">
            Manage administrative timelines and enforce commercial fee schedules.
          </p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
           <button 
             onClick={() => setActiveTab('admin')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <Gavel className="w-4 h-4" /> Admin Process
           </button>
           <button 
             onClick={() => setActiveTab('fees')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'fees' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <DollarSign className="w-4 h-4" /> Fee Enforcer
           </button>
        </div>
      </div>

      {activeTab === 'admin' && (
        <div className="flex flex-col lg:flex-row gap-8 flex-1 h-full">
           {/* Sidebar List */}
           <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                 <h3 className="text-xs font-bold text-slate-500 uppercase">Start New Process</h3>
                 <input 
                   placeholder="Respondent (e.g. IRS Commissioner)"
                   value={newProcess.respondent}
                   onChange={e => setNewProcess({...newProcess, respondent: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                 />
                 <input 
                   placeholder="Subject (e.g. Notice of Levy)"
                   value={newProcess.subject}
                   onChange={e => setNewProcess({...newProcess, subject: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                 />
                 <button 
                   onClick={handleCreateProcess}
                   disabled={!newProcess.respondent}
                   className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   <Plus className="w-4 h-4" /> Initialize
                 </button>
              </div>

              <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 overflow-y-auto space-y-2">
                 {processes.map(p => (
                   <div 
                     key={p.id}
                     onClick={() => setSelectedProcess(p)}
                     className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedProcess?.id === p.id ? 'bg-amber-900/20 border-amber-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                   >
                      <div className="flex justify-between items-start mb-1">
                         <span className="font-bold text-slate-200 text-sm">{p.respondent}</span>
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteProcess(p.id); }} className="text-slate-600 hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
                      </div>
                      <div className="text-xs text-slate-500 truncate mb-2">{p.subject}</div>
                      <div className="flex justify-between items-center text-[10px]">
                         <span className={`px-2 py-0.5 rounded ${p.status === 'Complete' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{p.status}</span>
                         <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(p.nextActionDate).toLocaleDateString()}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Detail / Dashboard */}
           <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
              {selectedProcess ? (
                <div className="flex flex-col h-full">
                   <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedProcess.respondent}</h2>
                        <p className="text-sm text-slate-400">Ref: {selectedProcess.id.slice(0,8)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                            <span className="block text-xs text-slate-500 uppercase">Next Deadline</span>
                            <span className="text-amber-500 font-mono font-bold">{new Date(selectedProcess.nextActionDate).toLocaleDateString()}</span>
                         </div>
                         <button 
                           onClick={advanceStep}
                           disabled={selectedProcess.status === 'Complete'}
                           className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-medium disabled:opacity-50"
                         >
                           Advance Step
                         </button>
                      </div>
                   </div>

                   <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                      {/* Timeline */}
                      <div className="flex items-center w-full max-w-2xl mx-auto relative">
                         <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -z-10" />
                         {['Step 1', 'Step 2', 'Step 3'].map((step, i) => {
                            const stepName = step === 'Step 1' ? 'Inquiry' : step === 'Step 2' ? 'Fault' : 'Default';
                            const currentStepNum = parseInt(selectedProcess.status.split(' ')[1]) || 4;
                            const isActive = i + 1 <= currentStepNum;
                            
                            return (
                              <div key={step} className="flex-1 flex flex-col items-center">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${isActive ? 'bg-amber-500 border-amber-500 text-black' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                                    {i + 1}
                                 </div>
                                 <span className={`mt-2 text-xs ${isActive ? 'text-amber-400' : 'text-slate-600'}`}>{stepName}</span>
                              </div>
                            );
                         })}
                      </div>
                   </div>

                   <div className="flex-1 p-6 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            Draft Notice for {selectedProcess.status}
                         </h3>
                         <button 
                           onClick={handleGenerateNotice}
                           disabled={isGenerating || selectedProcess.status === 'Complete'}
                           className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 disabled:opacity-50"
                         >
                           {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : "Generate Document"}
                         </button>
                      </div>
                      
                      <div className="flex-1 bg-white text-black p-8 rounded shadow-inner overflow-y-auto font-serif text-sm whitespace-pre-wrap">
                         {generatedNotice || <span className="text-gray-400 italic">Document pending generation...</span>}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                   <Clock className="w-16 h-16 mb-4 opacity-20" />
                   <p>Select a process to manage timeline.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="flex flex-col lg:flex-row gap-8 flex-1 h-full">
           <div className="w-full lg:w-1/3 bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-800 pb-2">Issue New Invoice</h3>
              
              <div>
                 <label className="text-xs text-slate-400 block mb-1">Violator Name</label>
                 <input 
                   value={newInvoice.violator}
                   onChange={e => setNewInvoice({...newInvoice, violator: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                 />
              </div>
              <div>
                 <label className="text-xs text-slate-400 block mb-1">Violation Type</label>
                 <select 
                   value={newInvoice.violationType}
                   onChange={e => setNewInvoice({...newInvoice, violationType: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                 >
                    <option>Trespass</option>
                    <option>Unauthorized Use of Name</option>
                    <option>Unsolicited Contact</option>
                    <option>Failure to Validate Debt</option>
                 </select>
              </div>
              <div>
                 <label className="text-xs text-slate-400 block mb-1">Fee Amount</label>
                 <input 
                   value={newInvoice.amount}
                   onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                 />
              </div>

              <button 
                onClick={handleCreateInvoice}
                disabled={isGenerating || !newInvoice.violator}
                className="w-full mt-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                Generate & Send
              </button>

              <div className="mt-8 pt-6 border-t border-slate-800">
                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Invoice History</h4>
                 <div className="space-y-2 max-h-64 overflow-y-auto">
                    {invoices.map(inv => (
                       <div key={inv.id} className="p-3 bg-slate-950 rounded border border-slate-800 text-sm flex justify-between items-center">
                          <div>
                             <div className="font-bold text-slate-200">{inv.violator}</div>
                             <div className="text-xs text-slate-500">{inv.invoiceNumber} • ${inv.amount}</div>
                          </div>
                          <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded uppercase">{inv.status}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex-1 bg-slate-100 rounded-xl p-8 text-slate-900 overflow-y-auto relative shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-12 bg-slate-200 border-b border-slate-300 flex items-center justify-between px-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Commercial Invoice</span>
                  <div className="flex gap-2">
                    <button className="text-slate-500 hover:text-slate-800" title="Copy"><Copy className="w-4 h-4" /></button>
                    <button className="text-slate-500 hover:text-slate-800" title="Download"><Download className="w-4 h-4" /></button>
                  </div>
               </div>
               <div className="mt-8 font-serif text-sm leading-relaxed whitespace-pre-wrap">
                 {generatedInvoiceDoc || (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none py-20">
                      <DollarSign className="w-16 h-16 mb-4 opacity-20" />
                      <p>Generate an invoice to enforce your Fee Schedule.</p>
                   </div>
                 )}
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RemedyTracker;
