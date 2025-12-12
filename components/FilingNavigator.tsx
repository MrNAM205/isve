
import React, { useState } from 'react';
import { 
  Milestone, 
  ChevronRight, 
  CheckCircle, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Search,
  Scale,
  Map
} from 'lucide-react';

interface FilingStep {
  title: string;
  desc: string;
  links?: { label: string, url: string }[];
}

interface Workflow {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  steps: FilingStep[];
}

const WORKFLOWS: Workflow[] = [
  {
    id: 'vr-tracing',
    title: 'Vital Record Tracing (Book & Page)',
    icon: <Map className="w-6 h-6 text-purple-500" />,
    description: 'Locate the original county-level filing coordinates (Book & Page) where the title was first created before State consolidation.',
    steps: [
      {
        title: 'Identify County of Birth',
        desc: 'The original "Certificate of Live Birth" is typically filed with the County Clerk or Recorder where the event occurred before being transmitted to the State. You need the specific County.'
      },
      {
        title: 'Contact County Recorder',
        desc: 'Call the "Vital Records" division of the County Clerk/Recorder. Do not call the State Capital yet. You are looking for the original ledger entry.',
      },
      {
        title: 'Request "Book and Page"',
        desc: 'Ask the clerk: "I am looking for the Book and Page number for a birth certificate filed on [Date of Birth] for [Name]." This locates the physical ledger entry.',
      },
      {
        title: 'Order County Certified Copy',
        desc: 'If found, order a copy specifically from the County using these coordinates. It often contains different signatures (Local Registrar) and may reveal the "Local File Number" distinct from the State File Number.'
      }
    ]
  },
  {
    id: 'bc-auth',
    title: 'Birth Certificate Authentication',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    description: 'The "Red Ink" process to transform a State-issued birth certificate into a foreign authenticated instrument (DS-4194).',
    steps: [
      {
        title: 'Acquire Certified Long-Form',
        desc: 'Order a fresh "Certified Copy of Live Birth" from the Vital Statistics office of your birth state. Ensure it includes the "Registrar Name" and "File Date".',
        links: [{label: 'VitalChek (Official)', url: 'https://www.vitalchek.com'}]
      },
      {
        title: 'State Authentication',
        desc: 'Send the certified copy to the Secretary of State (of the birth state) for "Authentication" (not Apostille, unless foreign use). This adds a cover sheet verifying the Registrar\'s signature.',
      },
      {
        title: 'Federal Authentication',
        desc: 'Send the State-Authenticated package to the U.S. Department of State in D.C. with Form DS-4194. This is the final layer that makes it a "Foreign" document.',
        links: [{label: 'Form DS-4194 (PDF)', url: 'https://eforms.state.gov/Forms/ds4194.pdf'}]
      },
      {
        title: 'Secure Deposit',
        desc: 'Once returned with the Federal seal, deposit the instrument into your Private Trust via the "Assignment of Title" module.'
      }
    ]
  },
  {
    id: 'cusip-search',
    title: 'CUSIP / Fidelity Retrieval',
    icon: <Search className="w-6 h-6 text-cyan-500" />,
    description: 'Locate the securities identifier associated with the Trust Indenture or State File Number.',
    steps: [
      {
        title: 'Identify the Issuer',
        desc: 'The "Issuer" is typically the State Vital Statistics unit or a specific Trust created around the birth year. You are looking for a security where the state is the obligor.'
      },
      {
        title: 'Query Fidelity / Bloomberg',
        desc: 'Use the "State File Number" (often found in red on the BC) as a reference. Search commercially available terminals (Bloomberg/Fidelity) for bond instruments matching the birth year and state.'
      },
      {
        title: 'Analyze EDGAR',
        desc: 'Search the SEC EDGAR database for 10-K or S-1 filings from the State Department of Revenue around the birth year.'
      }
    ]
  },
  {
    id: 'ucc-perfection',
    title: 'UCC-1 Commercial Perfection',
    icon: <Scale className="w-6 h-6 text-amber-500" />,
    description: 'Perfecting the security interest of the Living Man over the Corporate Strawman.',
    steps: [
      {
        title: 'Execute Security Agreement',
        desc: 'Draft and sign a private Security Agreement where the Debtor (JOHN DOE) pledges all assets to the Secured Party (John Doe). Use the "Template Library".'
      },
      {
        title: 'Draft UCC-1 Financing Statement',
        desc: 'Use the UCC Filing module. Debtor = ALL CAPS NAME. Secured Party = Living Name. Collateral = "All assets...".'
      },
      {
        title: 'File with Secretary of State',
        desc: 'File the UCC-1 in the birth state (where the "Trust" was created) or the current residence state. Pay the filing fee.'
      },
      {
        title: 'Get Certified Copy',
        desc: 'Request a certified copy of the filed UCC-1. This is your "Title" to the strawman.'
      }
    ]
  },
  {
    id: 'affidavit-recording',
    title: 'Affidavit of Status Recording',
    icon: <FileText className="w-6 h-6 text-indigo-500" />,
    description: 'Placing your claim of status and capacity on the public record via the County Recorder.',
    steps: [
      {
        title: 'Draft Affidavit',
        desc: 'Generate your "Affidavit of Status" or "Declaration of Status" using the Status Correction module. Ensure all facts are correct.'
      },
      {
        title: 'Notarize (Jurat)',
        desc: 'Take the document to a Notary Public. You must sign in their presence. Use a Jurat ("Subscribed and Sworn") to give it affidavit strength.'
      },
      {
        title: 'Record at County',
        desc: 'Take the original to the County Clerk / Recorder\'s Office. Ask to record it in the "Miscellaneous" or "Public Notice" book. If they resist, ask for "Land Records" indexing against your own name.'
      },
      {
        title: 'Obtain Certified Copy',
        desc: 'Once recorded, purchase a Certified Copy with the County Seal. This certified copy is your portable evidence of status for court or police encounters.'
      }
    ]
  }
];

const FilingNavigator: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);

  return (
    <div className="flex flex-col h-full gap-6">
       <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Milestone className="w-8 h-8 text-blue-500" />
            Filing Navigator
          </h2>
          <p className="text-slate-400 mt-2">
            Dynamic workflow engine for complex commercial processes. Follow step-by-step guides for authentication and perfection.
          </p>
       </div>

       {activeWorkflow ? (
         <div className="flex-1 flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-right-4">
            <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                     {activeWorkflow.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{activeWorkflow.title}</h3>
                    <p className="text-sm text-slate-400">{activeWorkflow.description}</p>
                  </div>
               </div>
               <button 
                 onClick={() => setActiveWorkflow(null)}
                 className="text-sm text-slate-400 hover:text-white px-4 py-2 hover:bg-slate-800 rounded transition-colors"
               >
                 Back to Overview
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-12 top-8 bottom-8 w-0.5 bg-slate-800" />

                <div className="space-y-12">
                   {activeWorkflow.steps.map((step, idx) => (
                      <div key={idx} className="relative pl-16">
                         {/* Check Bubble */}
                         <div className="absolute left-8 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-blue-500 font-bold z-10">
                            {idx + 1}
                         </div>
                         
                         <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
                            <h4 className="text-lg font-bold text-slate-200 mb-2">{step.title}</h4>
                            <p className="text-slate-400 leading-relaxed mb-4">{step.desc}</p>
                            
                            {step.links && (
                               <div className="flex gap-3">
                                  {step.links.map((link, lIdx) => (
                                     <a 
                                       key={lIdx} 
                                       href={link.url} 
                                       target="_blank" 
                                       rel="noreferrer"
                                       className="text-xs bg-blue-600/10 text-blue-400 px-3 py-1.5 rounded-full flex items-center gap-2 hover:bg-blue-600/20 transition-colors"
                                     >
                                        <ExternalLink className="w-3 h-3" /> {link.label}
                                     </a>
                                  ))}
                               </div>
                            )}
                         </div>
                      </div>
                   ))}
                   
                   <div className="relative pl-16">
                      <div className="absolute left-8 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold z-10">
                         <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="pt-1">
                        <span className="text-emerald-500 font-bold">Process Complete</span>
                      </div>
                   </div>
                </div>
            </div>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKFLOWS.map(wf => (
               <button 
                 key={wf.id}
                 onClick={() => setActiveWorkflow(wf)}
                 className="bg-slate-900 text-left p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all group"
               >
                 <div className="mb-4 p-3 bg-slate-950 rounded-lg w-fit group-hover:scale-110 transition-transform">
                    {wf.icon}
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{wf.title}</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">{wf.description}</p>
                 <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                    Start Guide <ChevronRight className="w-4 h-4" />
                 </div>
               </button>
            ))}
         </div>
       )}
    </div>
  );
};

export default FilingNavigator;
