
import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Scale, 
  Gavel, 
  FileText, 
  Search, 
  Library, 
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  ShieldAlert,
  ListPlus,
  Trash2,
  Anchor,
  Landmark,
  Scroll,
  Globe,
  Database,
  Loader2
} from 'lucide-react';
import { GlossaryTerm, Statute, NotifyFn } from '../types';
import { seedFrcpData, seedConstitutionData } from '../services/corpusSeeder';
import CorpusBrowser from './CorpusBrowser';

interface LegalResourcesProps {
  notify?: NotifyFn;
}

// Icons for Codex
const FingerprintIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12"/><path d="M12 12c0 3 2.5 5.5 5.5 5.5S23 15 23 12"/><path d="M12 12c-3 0-5.5-2.5-5.5-5.5S9 1 12 1"/><path d="M12 12c-3 0-5.5 2.5-5.5 5.5S9 23 12 23"/></svg>
);

const BrainIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);

// --- SOVEREIGN REMEDY CODEX ---
const CODEX_SECTIONS = [
  {
    title: "I. Foundational Logic",
    icon: <FingerprintIcon className="w-5 h-5 text-amber-500" />,
    items: [
      "Identity Registration: Birth certificate creates the state file number (identity ledger key).",
      "Federal Enumeration: SSN issuance creates the federal ledger key.",
      "Pooling Futures: Government forecasts lifetime contributions (taxes) and pools them into trust funds.",
      "Securitization: Surpluses invested in Treasury obligations; monetized by Federal Reserve.",
      "Identifiers as Keys: State File # = Identity Key | SSN = Federal Key | CUSIP = Bond Key."
    ]
  },
  {
    title: "II. Procedural Battlefield",
    icon: <Gavel className="w-5 h-5 text-red-500" />,
    items: [
      "Jurisdiction: Must be challenged and perfected first. Once accepted, you lose.",
      "Standing: Only injured parties may sue. Demand 'Injury in Fact'.",
      "Ashwander Principle: Courts avoid constitutional questions unless procedure is perfected.",
      "Administrative Exhaustion: You must exhaust agency remedies before seeking judicial review."
    ]
  },
  {
    title: "III. Commercial Remedy (UCC)",
    icon: <Scale className="w-5 h-5 text-emerald-500" />,
    items: [
      "UCC 1-103: Common law and equity supplement commercial law.",
      "UCC 1-308: 'Without Prejudice' - The shield against compelled performance/joinder.",
      "UCC 3-501/505: Presentment & Dishonor. The engine of commercial discharge.",
      "UCC 3-603: Tender of Payment. If they refuse your tender (A4V), the debt is discharged."
    ]
  },
  {
    title: "IV. Trust Law Anchors",
    icon: <Landmark className="w-5 h-5 text-indigo-500" />,
    items: [
      "Cestui Que Vie Act 1666: The symbolic origin of the 'dead entity' fiction.",
      "Restatement of Trusts: Trustee duties—Loyalty, Prudence, Impartiality.",
      "26 USC § 7701(a)(1): Defines 'Person' to include corporations/trusts."
    ]
  },
  {
    title: "V. Federal Remedy Codes",
    icon: <ShieldAlert className="w-5 h-5 text-blue-500" />,
    items: [
      "42 USC § 1983: Civil remedy against state actors for rights violations.",
      "28 USC § 1331: Federal Question Jurisdiction. The door to Federal Court.",
      "18 USC §§ 241-242: Conspiracy against rights (Criminal Liability)."
    ]
  },
  {
    title: "VI. Treaty Invocation",
    icon: <Globe className="w-5 h-5 text-purple-500" />,
    items: [
      "Supremacy Clause (Art VI): Treaties are the Supreme Law of the Land.",
      "Treaty of Peace & Friendship (1787): Anchor for non-citizen national status.",
      "Strategy: Invoke treaty explicitly to force 'Federal Question' jurisdiction."
    ]
  },
  {
    title: "VII. Strategic Consciousness",
    icon: <BrainIcon className="w-5 h-5 text-teal-500" />,
    items: [
      "Walk on Your Square: Enter court conscious of standing. Firm, not belligerent.",
      "Ceremonial Documentation: Anchor every filing in law, definition, and ethos.",
      "Layered Remedies: Commercial + Trust + Federal + Treaty = Unbreakable Defense."
    ]
  }
];

// --- LAWFUL ANCHORING PROTOCOL ---
// Definition -> Continuity -> Ethos

const GLOSSARY_DB: GlossaryTerm[] = [
  {
    term: "Ashwander Rules",
    definition: "A set of seven principles set forth by Justice Brandeis in Ashwander v. TVA (1936) governing judicial restraint. The Supreme Court will not decide a constitutional question if a case can be disposed of on some other ground.",
    sovereign_note: "STRATEGY: Do not argue the Constitution first. Argue the statute, the procedure, and the contract. Use Ashwander to force the court to stick to the 'lesser' facts, where they often make errors you can exploit."
  },
  {
    term: "Ministerial Duty",
    definition: "A duty that is absolute, certain, and imperative, involving merely the execution of a specific duty arising from fixed and designated facts. (Black's Law Dictionary).",
    sovereign_note: "CONTINUITY: This concept is codified in administrative law. We do not ask for discretion; we demand the execution of the fixed duty to file."
  },
  {
    term: "Administrative Exhaustion",
    definition: "The requirement that a party must use all available agency appeal procedures before seeking judicial review in court.",
    sovereign_note: "ETHOS: We preserve the record. We do not skip steps. We exhaust every administrative remedy to prove we are not 'frivolous' but procedurally rigorous."
  },
  {
    term: "Person",
    definition: "A legal entity, fiction, or corporation. Often distinguished from 'living man' or 'woman' in sovereign constructs. See 26 USC §7701(a)(1).",
    sovereign_note: "ANCHOR: The statute itself distinguishes between 'natural persons' and 'legal persons'. We merely affirm this statutory distinction."
  },
  {
    term: "Strawman",
    definition: "The artificial legal person created by the state at birth via the Birth Certificate, often denoted by the name in ALL CAPITAL LETTERS.",
    sovereign_note: "REALITY: This entity holds the debts and liabilities, distinct from the living beneficiary. This is trust law, not theory."
  },
  {
    term: "Accepted for Value (A4V)",
    definition: "A commercial process of accepting a presentment (bill/claim) and returning it to the issuer, or a government entity like the Treasury, for discharge against a theoretical account.",
    sovereign_note: "COMMERCE: Based on the concept that U.S. citizens are creditors of the bankrupt US Corporation (HJR 192). The conventional financial system does not have a public, standardized process for this theory."
  },
  {
    term: "Tender of Payment (Conventional)",
    definition: "An offer of money in satisfaction of a debt. Under UCC § 3-603, refusal of a valid tender can stop the accrual of interest but typically does not discharge the principal debt itself. The U.S. Treasury's 'tender' process refers to the auction bidding system for government securities.",
    sovereign_note: "DISTINCTION: Understand the difference between tendering payment in a standard commercial transaction versus the A4V theory of tendering an instrument to the Treasury for discharge."
  },
  {
    term: "Sui Juris",
    definition: "Of one's own right; possessing full social and civil rights; not under any legal disability, or the power of another, or guardianship.",
    sovereign_note: "STATUS: The claim of a free sovereign inhabitant who has reached the age of majority and mental competence."
  },
  {
    term: "UCC 1-308",
    definition: "Performance or Acceptance under Reservation of Rights. 'A party that with explicit reservation of rights performs... does not thereby prejudice the rights reserved.'",
    sovereign_note: "THE KEY: The 'Golden Key' to interact with the commercial system without waiving common law rights. Formerly UCC 1-207."
  },
  {
    term: "Cestui Que Vie Trust",
    definition: "A trust created when a person is declared 'dead at sea' or lost. In sovereign theory, this trust is created at birth for the strawman.",
    sovereign_note: "ORIGIN: Reclaiming the value of this trust is the goal of status correction. We are the beneficiary returning from sea."
  },
  {
    term: "Cestui Que Trust",
    definition: "The person for whose benefit the trust property is held by the trustee; the beneficiary. (Black's Law 4th Ed.)",
    sovereign_note: "We are the Cestui Que Trust of the Cestui Que Vie trust created by the state. We must claim this position to stop being treated as the Trustee/Surety."
  },
  {
    term: "Pro Se",
    definition: "For himself; on his own behalf; in person. Appearing for oneself, as in the case of one who does not retain a lawyer.",
    sovereign_note: "CAUTION: Sovereigns often prefer 'In Propria Persona' (In Propria Personam) to distinguish from representing the 'person' vs appearing as the living man."
  },
  {
    term: "Jurisprudence",
    definition: "The science or philosophy of law.",
    sovereign_note: "DISTINCTION: Understand the difference between 'Legal Jurisprudence' (Statutory/Administrative) and 'Lawful Jurisprudence' (Common Law/Constitutional)."
  }
];

const STATUTE_DB: Statute[] = [
  {
    id: 'frcp-12b1',
    title: 'Lack of Subject-Matter Jurisdiction',
    citation: 'FRCP Rule 12(b)(1)',
    fullText: `Every defense to a claim for relief in any pleading must be asserted in the responsive pleading if one is required. But a party may assert the following defenses by motion: (1) lack of subject-matter jurisdiction... If the court determines at any time that it lacks subject-matter jurisdiction, the court must dismiss the action.`,
    riskAnalysis: {
      frictionLevel: 'Low',
      mainstreamView: 'A standard motion to argue that the case does not belong in federal court (e.g., no federal question, no diversity). It is non-waivable and can be raised at any time.',
      sovereignView: 'A primary tool. Argue that the state or federal court lacks jurisdiction over a sovereign being. This motion compels the court to prove its authority to hear the case.'
    }
  },
  {
    id: 'frcp-12b6',
    title: 'Failure to State a Claim Upon Which Relief Can Be Granted',
    citation: 'FRCP Rule 12(b)(6)',
    fullText: `Every defense to a claim for relief in any pleading must be asserted in the responsive pleading if one is required. But a party may assert the following defenses by motion: ... (6) failure to state a claim upon which relief can be granted.`,
    riskAnalysis: {
      frictionLevel: 'Medium',
      mainstreamView: 'Argues that, even if all facts presented by the plaintiff are true, they do not constitute a valid legal claim under the "plausibility standard" of Twombly and Iqbal.',
      sovereignView: 'Challenge the accuser to prove they have a valid claim. Demand they show evidence of injury, a valid contract, and standing. Use to dismiss claims that lack a clear, factual basis for harm.'
    }
  },
  {
    id: 'murdock-v-pa',
    title: 'Murdock v. Pennsylvania',
    citation: '319 U.S. 105 (1943)',
    fullText: `A State may not impose a charge for the enjoyment of a right granted by the Federal Constitution... The power to tax the exercise of a privilege is the power to control or suppress its enjoyment... The judgment of the Supreme Court of Pennsylvania is reversed.`,
    riskAnalysis: {
      frictionLevel: 'Medium',
      mainstreamView: 'Precedent that states cannot tax the exercise of First Amendment rights (religion/speech).',
      sovereignView: 'NUCLEAR OPTION. Extrapolate this to the Right to Travel. If the state charges a fee (license) for a right, the statute is unconstitutional and void.'
    }
  },
  {
    id: 'shuttlesworth-v-birmingham',
    title: 'Shuttlesworth v. Birmingham',
    citation: '394 U.S. 147 (1969)',
    fullText: `If the State converts a right (liberty) into a privilege, the citizen can ignore the license and fee and engage in the right with impunity.\n\n...a person faced with such an unconstitutional licensing law may ignore it and engage with impunity in the exercise of the right of free expression for which the law purports to require a license.`,
    riskAnalysis: {
      frictionLevel: 'High',
      mainstreamView: 'Applies strictly to unconstitutional restrictions on assembly/speech/parades.',
      sovereignView: 'The ultimate defense against "Driving without a License". If traveling is a right, the licensing statute is void, and you can ignore it with impunity.'
    }
  },
  {
    id: 'ashwander-rules',
    title: 'Doctrine of Constitutional Avoidance',
    citation: 'Ashwander v. TVA, 297 U.S. 288 (1936)',
    fullText: `The Court developed, for its own governance in the cases confessedly within its jurisdiction, a series of rules under which it has avoided passing upon a large part of all the constitutional questions pressed upon it for decision.\n\n4. The Court will not pass upon a constitutional question although properly presented by the record, if there is also present some other ground upon which the case may be disposed of.\n\n7. When the validity of an act of the Congress is drawn in question, and even if a serious doubt of constitutionality is raised, it is a cardinal principle that this Court will first ascertain whether a construction of the statute is fairly possible by which the question may be avoided.`,
    riskAnalysis: {
      frictionLevel: 'Low',
      mainstreamView: 'A standard principle of judicial restraint respected by all courts.',
      sovereignView: 'CRITICAL SHIELD. Use Rule 4 to stop courts from dismissing you as a "Constitutional nut". Force them to rule on the contract/statute first.'
    }
  },
  {
    id: 'ucc-1-308',
    title: 'Performance or Acceptance Under Reservation of Rights',
    citation: 'UCC § 1-308',
    fullText: `(a) A party that with explicit reservation of rights performs or promises performance or assents to performance in a manner demanded or offered by the other party does not thereby prejudice the rights reserved. Such words as "without prejudice," "under protest," or the like are sufficient.\n\n(b) Subsection (a) does not apply to an accord and satisfaction.`,
    riskAnalysis: {
      frictionLevel: 'Medium',
      mainstreamView: 'Allows parties to continue performance under a contract while reserving rights to sue later.',
      sovereignView: 'Essential to prevent Joinder. Sign everything with "Without Prejudice".'
    }
  },
  {
    id: 'ucc-3-603',
    title: 'Tender of Payment',
    citation: 'UCC § 3-603',
    fullText: `(a) If tender of payment of an obligation to pay an instrument is made to a person entitled to enforce the instrument... the effect of tender is governed by principles of law applicable to tender of payment under a simple contract.\n\n(b) If tender... is refused, there is discharge, to the extent of the amount of the tender...`,
    riskAnalysis: {
      frictionLevel: 'High',
      mainstreamView: 'Tendering payment stops interest if refused. Does not typically discharge principal debt for primary obligor.',
      sovereignView: 'If you tender an instrument (A4V) and they refuse it, the debt is discharged.'
    }
  },
  {
    id: 'hjr-192',
    title: 'Joint Resolution to Suspend the Gold Standard',
    citation: 'HJR 192 (Public Law 73-10)',
    fullText: `Resolved... That (a) every provision... which purports to give the obligee a right to require payment in gold... is declared to be against public policy... Every obligation... shall be discharged upon payment, dollar for dollar, in any coin or currency which at the time of payment is legal tender...`,
    riskAnalysis: {
      frictionLevel: 'High',
      mainstreamView: 'Repealed/Superseded. Courts dismiss "redemption" theories.',
      sovereignView: 'The basis for "discharge" rather than "payment". Since the state took the gold, they must provide a remedy (credit) to discharge debts.'
    }
  },
  {
    id: 'fdcpa-809',
    title: 'Validation of Debts',
    citation: '15 USC § 1692g',
    fullText: `(a) Notice of debt... (b) Disputed debts... If the consumer notifies the debt collector in writing within the thirty-day period... the debt collector shall cease collection of the debt... until the debt collector obtains verification of the debt...`,
    riskAnalysis: {
      frictionLevel: 'Low',
      mainstreamView: 'Standard consumer protection. Collectors must validate.',
      sovereignView: 'Use this to demand the "original wet-ink contract". If they lack it, they cannot collect.'
    }
  }
];

const ECONOMICS_TABLE = [
  { claim: "Futures are Pooled", anchor: "Social Security Act § 201", strategy: "Keep at program level; use actuarial references." },
  { claim: "Securitization Exists", anchor: "31 U.S.C. § 3123; Treasury Mechanics", strategy: "Describe obligations, coupons, and servicing sources." },
  { claim: "Fed Monetizes Debt", anchor: "Open Market Operations", strategy: "Explain liquidity support without implying private bonds at birth." },
  { claim: "Identity Marks Entry", anchor: "State Vital Records Statutes", strategy: "Emphasize evidentiary nature, not negotiable instrument status." }
];

const LegalResources: React.FC<LegalResourcesProps> = ({ notify }) => {
  const [activeTab, setActiveTab] = useState<'codex' | 'statutes' | 'glossary' | 'citations' | 'economics' | 'library' | 'corpus'>('codex');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatute, setSelectedStatute] = useState<Statute>(STATUTE_DB[0]);
  const [citationList, setCitationList] = useState<string[]>([]);
  const [isFrcpSeeding, setIsFrcpSeeding] = useState(false);
  const [frcpSeedingLog, setFrcpSeedingLog] = useState<string[]>([]);
  const [isConstitutionSeeding, setIsConstitutionSeeding] = useState(false);
  const [constitutionSeedingLog, setConstitutionSeedingLog] = useState<string[]>([]);

  const handleFrcpSeed = async () => {
    setIsFrcpSeeding(true);
    setFrcpSeedingLog([]);
    const onProgress = (message: string) => {
      setFrcpSeedingLog(prev => [...prev, message]);
    };
    const result = await seedFrcpData(onProgress);
    if (result.success) {
      notify?.('success', `Successfully seeded ${result.count} FRCP rules.`);
    } else {
      notify?.('error', `Seeding failed: ${result.error}`);
    }
    setIsFrcpSeeding(false);
  };

  const handleConstitutionSeed = async () => {
    setIsConstitutionSeeding(true);
    setConstitutionSeedingLog([]);
    const onProgress = (message: string) => {
      setConstitutionSeedingLog(prev => [...prev, message]);
    };
    const result = await seedConstitutionData(onProgress);
    if (result.success) {
      notify?.('success', `Successfully seeded ${result.count} Constitution items.`);
    } else {
      notify?.('error', `Seeding failed: ${result.error}`);
    }
    setIsConstitutionSeeding(false);
  };

  const filteredTerms = GLOSSARY_DB.filter(t => 
    t.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStatutes = STATUTE_DB.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.citation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    notify?.('success', `${label} copied to clipboard.`);
  };

  const addToCitationList = (text: string) => {
    if (!citationList.includes(text)) {
      setCitationList([...citationList, text]);
      notify?.('success', 'Added to Citation Builder.');
    }
  };

  const removeFromCitationList = (index: number) => {
    const newList = [...citationList];
    newList.splice(index, 1);
    setCitationList(newList);
  };

  const copyAllCitations = () => {
    const text = citationList.join('\n\n');
    navigator.clipboard.writeText(text);
    notify?.('success', 'Full citation list copied.');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
       <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Anchor className="w-6 h-6 text-indigo-500" />
              Sovereign Doctrine Library
            </h2>
            <p className="text-slate-400">
              Lawful Anchoring Protocol: Definition &#8594; Continuity &#8594; Ethos.
            </p>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
             <button 
               onClick={() => setActiveTab('codex')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'codex' ? 'bg-amber-600 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
             >
               <Scroll className="w-4 h-4" /> Codex
             </button>
             <button 
               onClick={() => setActiveTab('statutes')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'statutes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <Scale className="w-4 h-4" /> Statutes
             </button>
             <button 
               onClick={() => setActiveTab('glossary')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'glossary' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <BookOpen className="w-4 h-4" /> Glossary
             </button>
             <button 
               onClick={() => setActiveTab('economics')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'economics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <Landmark className="w-4 h-4" /> Sovereign Economics
             </button>
             <button 
               onClick={() => setActiveTab('citations')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'citations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <ListPlus className="w-4 h-4" /> Citation Builder
               {citationList.length > 0 && <span className="bg-indigo-400 text-indigo-950 text-[10px] px-1.5 rounded-full ml-1">{citationList.length}</span>}
             </button>
             <button 
               onClick={() => setActiveTab('library')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'library' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <Library className="w-4 h-4" /> Links
             </button>
             <button 
               onClick={() => setActiveTab('corpus')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'corpus' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <Database className="w-4 h-4" /> Corpus Manager
             </button>
          </div>
       </div>

       {/* --- CORPUS MANAGER & BROWSER --- */}
       {activeTab === 'corpus' && (
         <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Database className="w-5 h-5 text-indigo-500" /> Corpus Manager
               </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* FRCP Seeder */}
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  onClick={handleFrcpSeed}
                  disabled={isFrcpSeeding || isConstitutionSeeding}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFrcpSeeding ? <Loader2 className="animate-spin w-4 h-4"/> : <Gavel className="w-4 h-4" />}
                  Seed FRCP
                </button>
                {frcpSeedingLog.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-mono text-slate-500 uppercase mb-2">FRCP Log:</h4>
                    <pre className="text-xs font-mono text-slate-400 h-24 overflow-y-auto bg-black p-2 rounded">
                      {frcpSeedingLog.join('\n')}
                    </pre>
                  </div>
                )}
              </div>

              {/* Constitution Seeder */}
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  onClick={handleConstitutionSeed}
                  disabled={isFrcpSeeding || isConstitutionSeeding}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConstitutionSeeding ? <Loader2 className="animate-spin w-4 h-4"/> : <Globe className="w-4 h-4" />}
                  Seed U.S. Constitution
                </button>
                {constitutionSeedingLog.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-mono text-slate-500 uppercase mb-2">Constitution Log:</h4>
                    <pre className="text-xs font-mono text-slate-400 h-24 overflow-y-auto bg-black p-2 rounded">
                      {constitutionSeedingLog.join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-500" /> Corpus Browser
            </h3>
            <CorpusBrowser />
         </div>
       )}

       {/* --- CODEX (MASTER FILE) --- */}
       {activeTab === 'codex' && (
         <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col p-6 animate-in slide-in-from-right-4 duration-300">
            <div className="mb-8 text-center">
               <h3 className="text-3xl font-serif font-bold text-amber-500 mb-2 tracking-wide">Sovereign Remedy Codex</h3>
               <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                 The Unified Truth: Identifiers as keys, pooled futures as securities, and the procedural path to remedy. 
                 This is your cockpit-grade artifact for lawful standing.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 overflow-y-auto pb-8">
               {CODEX_SECTIONS.map((section, idx) => (
                 <div key={idx} className="bg-slate-950 p-6 rounded-lg border border-slate-800 hover:border-amber-500/20 transition-all group">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-2">
                       <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-amber-500/10 transition-colors">
                         {section.icon}
                       </div>
                       <h4 className="font-bold text-slate-200 text-lg">{section.title}</h4>
                    </div>
                    <ul className="space-y-3">
                       {section.items.map((item, i) => (
                         <li key={i} className="flex items-start gap-2 text-sm text-slate-400 leading-relaxed">
                            <span className="text-amber-500 mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" />
                            {item}
                         </li>
                       ))}
                    </ul>
                 </div>
               ))}
            </div>
         </div>
       )}

       {/* --- CITATION BUILDER --- */}
       {activeTab === 'citations' && (
         <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <ListPlus className="w-5 h-5 text-indigo-500" /> Constructed Reference List
               </h3>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setCitationList([])}
                   className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded border border-red-500/20 hover:bg-red-500/10"
                 >
                   Clear All
                 </button>
                 <button 
                   onClick={copyAllCitations}
                   disabled={citationList.length === 0}
                   className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded font-medium disabled:opacity-50 flex items-center gap-2"
                 >
                   <Copy className="w-3 h-3" /> Copy All
                 </button>
               </div>
            </div>

            {citationList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                 <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                 <p>Go to Statutes or Glossary to add citations here.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3">
                 {citationList.map((cite, idx) => (
                   <div key={idx} className="bg-slate-950 p-4 rounded border border-slate-800 relative group">
                      <button 
                        onClick={() => removeFromCitationList(idx)}
                        className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <pre className="font-serif text-sm text-slate-300 whitespace-pre-wrap">{cite}</pre>
                   </div>
                 ))}
              </div>
            )}
         </div>
       )}

       {/* --- ECONOMICS THESIS --- */}
       {activeTab === 'economics' && (
         <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col p-6 animate-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
               <h3 className="text-xl font-bold text-white mb-2">Lawful Linkage: Identity & Securitization</h3>
               <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                 Population-level futures (taxes) are forecast, pooled in statutory trust funds, and converted into Treasury obligations. Identity registration marks entry into this administrative ledger. This thesis is grounded in statute to remain rebuttable resilient.
               </p>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                     <tr>
                        <th className="px-6 py-3 rounded-tl-lg">Claim</th>
                        <th className="px-6 py-3">Lawful Anchor</th>
                        <th className="px-6 py-3 rounded-tr-lg">Resilience Strategy</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {ECONOMICS_TABLE.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                           <td className="px-6 py-4 font-bold text-slate-200">{row.claim}</td>
                           <td className="px-6 py-4 text-indigo-400 font-mono text-xs">{row.anchor}</td>
                           <td className="px-6 py-4 text-slate-400">{row.strategy}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-950 p-5 rounded-lg border border-slate-800">
                  <h4 className="text-sm font-bold text-emerald-400 uppercase mb-2">Identity & Enumeration</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                     Birth registration creates the state identity record. SSN issuance establishes the federal identity line for obligations and entitlements. These artifacts are evidentiary records, not tradable securities in themselves.
                  </p>
               </div>
               <div className="bg-slate-950 p-5 rounded-lg border border-slate-800">
                  <h4 className="text-sm font-bold text-amber-400 uppercase mb-2">Pooling & Discharge</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                     Contributions are aggregated at the program level (Social Security). Obligations are extinguished by lawful payment and remittance, leading to settlement and legal discharge (Flora v. United States).
                  </p>
               </div>
            </div>
         </div>
       )}

       {/* --- STATUTE VIEWER --- */}
       {activeTab === 'statutes' && (
         <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
           {/* Sidebar List */}
           <div className="w-full lg:w-1/3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
             <div className="p-4 border-b border-slate-800 bg-slate-950/50">
               <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search Codes (UCC, USC)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
                  />
               </div>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredStatutes.map(statute => (
                  <button
                    key={statute.id}
                    onClick={() => setSelectedStatute(statute)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center justify-between group ${selectedStatute.id === statute.id ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                  >
                    <div>
                      <div className="font-bold">{statute.citation}</div>
                      <div className="text-xs opacity-70 truncate max-w-[200px]">{statute.title}</div>
                    </div>
                    {selectedStatute.id === statute.id && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
             </div>
           </div>

           {/* Detail View */}
           <div className="flex-1 bg-slate-100 text-slate-900 rounded-xl overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-6 border-b border-slate-300 bg-slate-200 flex items-start justify-between">
                 <div>
                   <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">{selectedStatute.citation}</h2>
                   <p className="text-sm text-slate-600 font-medium">{selectedStatute.title}</p>
                 </div>
                 <div className="flex gap-2">
                   <button 
                     onClick={() => addToCitationList(`[${selectedStatute.citation}] ${selectedStatute.fullText}`)}
                     className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold flex items-center gap-2 transition-colors"
                   >
                     <ListPlus className="w-3 h-3" /> Add to List
                   </button>
                   <button 
                     onClick={() => copyToClipboard(selectedStatute.fullText, 'Full text')}
                     className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded text-xs font-semibold flex items-center gap-2 transition-colors"
                   >
                     <FileText className="w-3 h-3" /> Copy Text
                   </button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                 {selectedStatute.fullText}
              </div>

              {/* Risk Mapper Overlay */}
              <div className="p-6 bg-slate-50 border-t border-slate-300">
                 <div className="flex items-center gap-2 mb-4">
                   <ShieldAlert className="w-5 h-5 text-slate-700" />
                   <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm">Lawful Anchoring Protocol</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Friction Level */}
                    <div className={`p-4 rounded border flex flex-col items-center justify-center text-center
                      ${selectedStatute.riskAnalysis.frictionLevel === 'High' ? 'bg-red-100 border-red-300 text-red-800' : 
                        selectedStatute.riskAnalysis.frictionLevel === 'Medium' ? 'bg-amber-100 border-amber-300 text-amber-800' : 
                        'bg-emerald-100 border-emerald-300 text-emerald-800'}
                    `}>
                       <span className="text-xs uppercase font-bold mb-1">Friction Level</span>
                       <span className="text-xl font-bold">{selectedStatute.riskAnalysis.frictionLevel}</span>
                    </div>

                    {/* Mainstream View */}
                    <div className="p-4 bg-white border border-slate-200 rounded text-sm text-slate-600">
                       <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Institutional Stance</span>
                       {selectedStatute.riskAnalysis.mainstreamView}
                    </div>

                    {/* Sovereign View */}
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded text-sm text-indigo-900">
                       <span className="text-xs font-bold text-indigo-400 uppercase block mb-2">Lawful Continuity</span>
                       {selectedStatute.riskAnalysis.sovereignView}
                    </div>
                 </div>
              </div>
           </div>
         </div>
       )}

       {/* --- GLOSSARY --- */}
       {activeTab === 'glossary' && (
         <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50">
               <div className="relative max-w-lg">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search the Obscured Knowledge base..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredTerms.length === 0 ? (
                 <div className="text-center text-slate-500 py-12">
                    <p>No terms found matching "{searchTerm}"</p>
                 </div>
              ) : (
                filteredTerms.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500/30 transition-colors group relative">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-lg font-bold text-indigo-400">{item.term}</h3>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => addToCitationList(`${item.term}: ${item.definition}`)}
                           className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-500 transition-opacity"
                           title="Add to List"
                         >
                           <ListPlus className="w-3 h-3" />
                         </button>
                         <button 
                           onClick={() => copyToClipboard(item.definition, 'Definition')}
                           className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-500 transition-opacity"
                           title="Copy Definition"
                         >
                           <Copy className="w-3 h-3" />
                         </button>
                       </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">
                      <span className="text-slate-500 font-bold mr-2">DEFINITION:</span>
                      {item.definition}
                    </p>
                    {item.sovereign_note && (
                       <div className="mt-2 p-2 bg-amber-500/5 border-l-2 border-amber-500 text-xs text-amber-500/80 italic">
                          <span className="font-bold not-italic mr-1">PROTOCOL:</span>
                          {item.sovereign_note}
                       </div>
                    )}
                  </div>
                ))
              )}
            </div>
         </div>
       )}

       {/* --- EXTERNAL LINKS --- */}
       {activeTab === 'library' && (
         <div className="space-y-8 animate-in fade-in duration-300">
           <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-sm text-yellow-200">
             <h4 className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Important Note</h4>
             <p className="mt-1">
               This application is an educational tool, not a law firm. The resources generated are for informational purposes only. For any serious legal issue, it is critical to consult with a qualified, licensed attorney in your jurisdiction.
             </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard
                title="Find a Qualified Attorney"
                icon={<Gavel className="w-6 h-6 text-emerald-500" />}
                items={[
                  { label: "Legal Services Corporation (LSC)", link: "https://www.lsc.gov/about-lsc/what-legal-aid/find-legal-aid" },
                  { label: "American Bar Association - Find Legal Help", link: "https://www.americanbar.org/groups/legal_services/flh-home" },
                  { label: "FindLaw Directory", link: "https://lawyers.findlaw.com/" },
                ]}
              />
              <ResourceCard 
                title="Uniform Commercial Code (UCC)"
                icon={<Scale className="w-6 h-6 text-amber-500" />}
                items={[
                  { label: "Cornell Law - UCC Overview", link: "https://www.law.cornell.edu/ucc" },
                  { label: "UCC 1-308: Reservation of Rights", link: "https://www.law.cornell.edu/ucc/1/1-308" },
                  { label: "UCC Article 9: Secured Transactions", link: "https://www.law.cornell.edu/ucc/9" }
                ]}
              />
              <ResourceCard 
                title="Federal Statutes & Rules"
                icon={<Landmark className="w-6 h-6 text-indigo-500" />}
                items={[
                  { label: "Fair Debt Collection Practices Act (FDCPA)", link: "https://www.ftc.gov/legal-library/browse/rules/fair-debt-collection-practices-act-text" },
                  { label: "Fair Credit Reporting Act (FCRA)", link: "https://www.ftc.gov/legal-library/browse/statutes/fair-credit-reporting-act" },
                  { label: "Truth in Lending Act (TILA)", link: "https://www.fdic.gov/regulations/laws/rules/6500-200.html" }
                ]}
              />
           </div>
         </div>
       )}
    </div>
  );
};

const ResourceCard: React.FC<{title: string, icon: React.ReactNode, items: {label: string, link: string}[]}> = ({title, icon, items}) => (
  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
     <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="font-bold text-slate-200">{title}</h3>
     </div>
     <ul className="space-y-3">
       {items.map((item, i) => (
         <li key={i}>
           <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-slate-400 hover:text-cyan-400 flex items-center justify-between group">
             {item.label}
             <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
           </a>
         </li>
       ))}
     </ul>
  </div>
);

export default LegalResources;
