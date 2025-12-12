
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Mail, 
  Phone, 
  Fingerprint,
  CheckCircle,
  Info
} from 'lucide-react';
import { IdentityProfile, NotifyFn } from '../types';
import { saveIdentityProfile, getIdentityProfile } from '../services/storage';

interface IdentityProfileProps {
  notify?: NotifyFn;
}

const IdentityProfileComponent: React.FC<IdentityProfileProps> = ({ notify }) => {
  const [profile, setProfile] = useState<IdentityProfile>({
    legalName: '',
    livingName: '',
    dateOfBirth: '',
    mailingAddress: '',
    domicileDeclaration: '',
    email: '',
    phoneNumber: '',
    taxId: ''
  });

  useEffect(() => {
    const saved = getIdentityProfile();
    if (saved) {
      setProfile(prev => ({...prev, ...saved}));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({...profile, [e.target.name]: e.target.value});
  };

  const handleSave = () => {
    saveIdentityProfile(profile);
    notify?.('success', 'Identity profile secured locally.');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="w-full lg:w-1/3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-sky-500" />
            Identity Management
          </h2>
          <p className="text-slate-400 mt-2">
            Store your sovereign identity details securely. Distinguish between your commercial mailing location and your lawful domicile.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-sky-400" /> Personal Details
            </h3>
            
            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Legal Name (ALL CAPS)</label>
              <input 
                type="text"
                name="legalName"
                value={profile.legalName}
                onChange={handleChange}
                placeholder="JOHN HENRY DOE"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Living Name (Upper & Lower)</label>
              <input 
                type="text"
                name="livingName"
                value={profile.livingName}
                onChange={handleChange}
                placeholder="John Henry: Doe"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-8 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <MapPin className="w-4 h-4 text-sky-400" /> Location & Tax
            </h3>
            
            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase mb-1">
                Mailing Address <span className="text-slate-500 normal-case">(Deliverable)</span>
              </label>
              <input 
                type="text"
                name="mailingAddress"
                value={profile.mailingAddress}
                onChange={handleChange}
                placeholder="123 Freedom Blvd OR PO Box 45"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase mb-1">
                Domicile Declaration <span className="text-slate-500 normal-case">(Sovereign)</span>
              </label>
              <textarea 
                name="domicileDeclaration"
                value={profile.domicileDeclaration}
                onChange={handleChange}
                placeholder="e.g. Non-domestic, without the United States..."
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 focus:outline-none h-20 resize-none text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Email</label>
                <input 
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 focus:outline-none text-sm"
                />
               </div>
               <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Phone</label>
                <input 
                    type="tel"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-sky-500 focus:outline-none text-sm"
                />
               </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Tax ID / SSN</label>
              <div className="relative">
                <CreditCard className="absolute left-2 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  name="taxId"
                  value={profile.taxId}
                  onChange={handleChange}
                  placeholder="XXX-XX-XXXX"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-8 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>

      {/* Info Column */}
      <div className="flex-1 space-y-6">
         
         <div className="bg-sky-900/10 border border-sky-500/20 p-6 rounded-xl">
            <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
               <MapPin className="w-5 h-5 text-sky-500" /> Address Strategy
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
               <strong>Lawful Usability vs. Sovereign Posture:</strong> To ensure your filings are processed and notices are received, you must use a deliverable mailing location.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
               <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span><strong>Mailing Address:</strong> Use a real street address, PO Box, or "c/o" address. This ensures delivery.</span>
               </li>
               <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <span><strong>Domicile Declaration:</strong> Use this field for affidavits to declare your status (e.g. "On the land," "Non-domestic"). Do not use this for the "Mail To" line.</span>
               </li>
            </ul>
         </div>

         <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-medium text-white mb-4">Stored Data Preview</h3>
            <div className="space-y-3 text-sm">
               <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Legal Entity</span>
                  <span className="font-mono text-slate-200">{profile.legalName || 'Not Set'}</span>
               </div>
               <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Natural Person</span>
                  <span className="font-mono text-slate-200">{profile.livingName || 'Not Set'}</span>
               </div>
               <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Mailing Loc</span>
                  <span className="font-mono text-slate-200 truncate max-w-[200px]">{profile.mailingAddress || 'Not Set'}</span>
               </div>
               <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Domicile</span>
                  <span className="font-mono text-slate-200 truncate max-w-[200px]">{profile.domicileDeclaration || 'Not Set'}</span>
               </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Tax ID / Exemption</span>
                  <span className="font-mono text-slate-200">{profile.taxId ? '********' : 'Not Set'}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default IdentityProfileComponent;
