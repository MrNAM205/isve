
import React, { useState, useEffect } from 'react';
import { Users, Plus, MapPin, Trash2 } from 'lucide-react';
import { Creditor } from '../types';
import { getCreditors, saveCreditor, removeCreditor } from '../services/storage';

const CreditorBook: React.FC = () => {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [newCreditor, setNewCreditor] = useState({ name: '', address: '', accountNumber: '' });

  useEffect(() => {
    setCreditors(getCreditors());
  }, []);

  const handleAddCreditor = () => {
    if (!newCreditor.name) return;
    const entry: Creditor = {
      id: Date.now().toString(),
      name: newCreditor.name,
      address: newCreditor.address,
      accountNumber: newCreditor.accountNumber,
      status: 'Active'
    };
    saveCreditor(entry);
    setCreditors(getCreditors());
    setNewCreditor({ name: '', address: '', accountNumber: '' });
  };

  const handleDeleteCreditor = (id: string) => {
    removeCreditor(id);
    setCreditors(getCreditors());
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Add Form */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" />
            Creditor Address Book
          </h2>
          <p className="text-slate-400 mt-2">
            Maintain a persistent registry of debt collectors and creditors.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
          <div>
             <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Creditor / Entity Name</label>
             <input 
               type="text"
               value={newCreditor.name}
               onChange={e => setNewCreditor({...newCreditor, name: e.target.value})}
               className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
             />
          </div>
          <div>
             <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Mailing Address</label>
             <input 
               type="text"
               value={newCreditor.address}
               onChange={e => setNewCreditor({...newCreditor, address: e.target.value})}
               className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
             />
          </div>
          <div>
             <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Ref / Account Number</label>
             <input 
               type="text"
               value={newCreditor.accountNumber}
               onChange={e => setNewCreditor({...newCreditor, accountNumber: e.target.value})}
               className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
             />
          </div>
          
          <button 
            onClick={handleAddCreditor}
            disabled={!newCreditor.name}
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Creditor
          </button>
        </div>
      </div>

      {/* List View */}
      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-medium text-white">Registry ({creditors.length})</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
           {creditors.length === 0 && (
             <div className="text-center text-slate-500 py-12 flex flex-col items-center">
               <Users className="w-12 h-12 mb-3 opacity-20" />
               <p>No creditors logged.</p>
             </div>
           )}
           
           {creditors.map(c => (
             <div key={c.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500/30 transition-colors group animate-in fade-in slide-in-from-bottom-2">
               <div className="flex justify-between items-start">
                 <div>
                   <h4 className="font-bold text-slate-200">{c.name}</h4>
                   <p className="text-xs text-slate-500 font-mono mt-1">ACCT: {c.accountNumber || 'N/A'}</p>
                 </div>
                 <button 
                   onClick={() => handleDeleteCreditor(c.id)}
                   className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
               <div className="mt-3 flex items-start gap-2 text-sm text-slate-400">
                 <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-500" />
                 <span>{c.address || "No address recorded"}</span>
               </div>
               <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {c.status.toUpperCase()}
                  </span>
                  <button className="text-xs text-indigo-400 hover:underline">Generate Notice</button>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default CreditorBook;