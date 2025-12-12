
import React, { useState } from 'react';
import { 
  Gavel, 
  MessageSquare, 
  Play, 
  BookOpen, 
  ShieldAlert,
  Mic,
  ArrowRight,
  RefreshCw,
  CheckSquare,
  Landmark,
  Scale,
  Car,
  FileText,
  PenTool,
  Loader2,
  Copy,
  Download,
  Scroll
} from 'lucide-react';
import { generateCustomDocument } from '../services/geminiService';

interface ScriptLine {
  speaker: 'Judge' | 'Sovereign' | 'Officer';
  text: string;
  note?: string;
}

// --- CONSTANTS ---

const PLEADING_TEMPLATES = [
  {
    id: 'treaty',
    title: 'Motion to Invoke Treaty Rights',
    icon: <Landmark className="w-5 h-5 text-amber-500" />,
    description: 'Mandatory Judicial Notice of the Supremacy Clause (Art VI) and Treaty of Peace & Friendship (1787).',
    systemPrompt: 'You are a Federal Rights Litigator. Draft a formal "Motion for Judicial Notice and Dismissal for Lack of Jurisdiction".',
    userPrompt: (data: any) => `
      Draft a formal Motion for the following case:
      Court: ${data.court}
      Case No: ${data.caseNumber}
      Plaintiff: ${data.plaintiff}
      Defendant: ${data.defendant}

      Title: MOTION TO INVOKE SUPREMACY CLAUSE AND TREATY RIGHTS

      Sections:
      1. Supremacy Clause (Art VI, Cl 2): Assert that treaties are supreme law.
      2. Treaty of Peace and Friendship (1787): Invoke status as non-citizen national/Moorish national.
      3. Fiduciary Duties: Remind court officers of their trustee obligations.
      4. Federal Question: Invoke 28 USC 1331.
      
      Prayer for Relief: Dismissal with prejudice.
      
      Tone: High formal, archaic but precise.
    `
  },
  {
    id: 'liberty_privilege',
    title: 'Motion to Dismiss: Rights vs. Privileges',
    icon: <Scroll className="w-5 h-5 text-emerald-500" />,
    description: 'Challenge licensing statutes that convert inherent liberties into taxable privileges (Murdock v. PA).',
    systemPrompt: 'You are a Constitutional Defense Attorney. Draft a "Motion to Dismiss and Judicial Notice of Unconstitutional Application of Statute".',
    userPrompt: (data: any) => `
      Draft a Motion to Dismiss for the following case:
      Court: ${data.court}
      Case No: ${data.caseNumber}
      
      Core Argument:
      The statute in question attempts to convert a fundamental liberty (Right to Travel/Work) into a state-granted privilege requiring a license and fee.
      
      Legal Anchors to Cite:
      1. Murdock v. Pennsylvania, 319 U.S. 105 (1943): "A State may not impose a charge for the enjoyment of a right granted by the Federal Constitution."
      2. Shuttlesworth v. Birmingham, 394 U.S. 147 (1969): "If the State converts a right (liberty) into a privilege, the citizen can ignore the license and fee and engage in the right with impunity."
      3. Supremacy Clause (Article VI): Constitutional rights supersede state statutes.
      
      Relief Requested:
      Dismissal of all charges as the statute is unconstitutional as applied to the Defendant operating in private capacity.
    `
  },
  {
    id: 'jurisdiction',
    title: 'Objection to Jurisdiction',
    icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
    description: 'Special Appearance to challenge Subject Matter and Personal Jurisdiction before entering a plea.',
    systemPrompt: 'You are a Constitutional Defense Attorney. Draft a "Notice of Special Appearance and Objection to Jurisdiction".',
    userPrompt: (data: any) => `
      Draft a Special Appearance Notice for:
      Court: ${data.court}
      Case No: ${data.caseNumber}
      
      Arguments:
      1. The Living Man appears by Special Appearance, not generally.
      2. Challenge Subject Matter Jurisdiction: No verified injured party/corpus delicti.
      3. Challenge Personal Jurisdiction: The "Defendant" is a corporate fiction; Affiant is not a surety.
      4. Demand proof of jurisdiction on the record.
    `
  },
  {
    id: 'fiduciary',
    title: 'Notice of Fiduciary Breach',
    icon: <Scale className="w-5 h-5 text-indigo-500" />,
    description: 'Notice to judges/clerks regarding liability for violating their oath of office.',
    systemPrompt: 'You are a Trust Law Specialist. Draft a "Constructive Notice of Fiduciary Breach".',
    userPrompt: (data: any) => `
      Draft a Notice of Breach for:
      Court: ${data.court}
      Case No: ${data.caseNumber}
      
      Arguments:
      1. Officers of the court are Trustees of the Public Trust.
      2. Violation of rights constitutes a breach of the Duty of Loyalty.
      3. Cites Restatement (Third) of Trusts.
      4. Warning of personal liability under 18 USC 241/242.
    `
  }
];

const SCENARIOS: {id: string, title: string, script: ScriptLine[]}[] = [
  {
    id: 'traffic_stop',
    title: 'Roadside / Traffic Stop Interaction',
    script: [
      { speaker: 'Officer', text: 'License and registration, please.' },
      { speaker: 'Sovereign', text: 'Is there an emergency, or am I being detained?', note: 'Establish if this is a consensual encounter or a detention immediately.' },
      { speaker: 'Officer', text: 'I stopped you for speeding. License and registration.' },
      { speaker: 'Sovereign', text: 'I am not operating in commerce or for hire. I am traveling in my private property. However, I will provide this notice of status through the window.', note: 'Do not hand over the license immediately if your goal is to challenge jurisdiction. Handing it over creates a contract.' },
      { speaker: 'Officer', text: 'Step out of the car.' },
      { speaker: 'Sovereign', text: 'I do not consent to any searches or seizures. I am complying under threat of duress and coercion. I reserve all rights (UCC 1-308).', note: 'If forced out, state clearly it is under duress. This preserves your remedy later.' }
    ]
  },
  {
    id: 'police_door',
    title: 'Police at Door (Knock & Talk)',
    script: [
      { speaker: 'Officer', text: 'Police! Open up! We just want to talk.' },
      { speaker: 'Sovereign', text: '(Through closed door) I do not consent to any searches or seizures. Do you have a warrant signed by a judge?', note: 'Never open the door. Opening the door can be interpreted as implied consent.' },
      { speaker: 'Officer', text: 'We received a complaint. We need to check the premises.' },
      { speaker: 'Sovereign', text: 'I do not wish to contract. Unless you have a warrant, you are trespassing. Please leave my property immediately.', note: 'Clearly revoke any implied license for them to be on your porch/property.' },
      { speaker: 'Officer', text: 'If you don\'t open the door, we will come back with a warrant.' },
      { speaker: 'Sovereign', text: 'I am exercising my 4th and 5th Amendment rights. I have nothing to say to you. Goodbye.', note: 'Stop talking. Silence is your best defense at this stage.' }
    ]
  },
  {
    id: 'traffic_court',
    title: 'Traffic Court Arraignment',
    script: [
      { speaker: 'Judge', text: 'How do you plead to the charge of driving without a license?' },
      { speaker: 'Sovereign', text: 'I am here by Special Appearance to challenge jurisdiction. I require the prosecution to verify that I was engaged in "transportation" for hire/profit.', note: 'Driving is a commercial term (carrying passengers/goods for pay). Traveling is a right.' },
      { speaker: 'Judge', text: 'The statute says anyone operating a motor vehicle is a driver.' },
      { speaker: 'Sovereign', text: 'The statute applies to "drivers" as defined in the code. I am not a "driver" in that capacity. I claim the Right to Travel under Shapiro v. Thompson. Does the state claim its statute supersedes the Supreme Court?', note: 'Anchor in the hierarchy of law: Constitution > Statute.' },
      { speaker: 'Judge', text: 'Enter a plea of Not Guilty.' },
      { speaker: 'Sovereign', text: 'I do not consent to your entering a plea for me. I demand a dismissal for lack of subject matter jurisdiction over private property.', note: 'Entering a plea waives the jurisdictional challenge.' }
    ]
  },
  {
    id: 'dl_rescission',
    title: 'Driver\'s License Rescission Hearing',
    script: [
      { speaker: 'Judge', text: 'You surrendered your license but continue to drive.' },
      { speaker: 'Sovereign', text: 'I rescinded my signature on the license contract due to constructive fraud and lack of full disclosure.', note: 'The fraud is that they did not tell you the license converts a right into a privilege.' },
      { speaker: 'Judge', text: 'What disclosure was missing?' },
      { speaker: 'Sovereign', text: 'I was not informed that applying for a license converts my Right to Travel into a commercial privilege regulatable by the state. A contract entered into without full disclosure is void ab initio.', note: 'Void ab initio means it never legally existed.' },
      { speaker: 'Sovereign', text: 'I have placed a Notice of Rescission on the public record. I am exercising my right to travel in my private capacity.', note: 'Always rely on the public record you created.' }
    ]
  },
  {
    id: 'ashwander',
    title: 'Constitutional Avoidance (Ashwander Pivot)',
    script: [
      { speaker: 'Judge', text: 'You are making constitutional arguments. This is not the venue for that.' },
      { speaker: 'Sovereign', text: 'Your Honor, I am specifically avoiding constitutional questions under the Ashwander Doctrine (297 U.S. 288).', note: 'Immediately cite Ashwander to show you know the rules of judicial restraint.' },
      { speaker: 'Judge', text: 'Explain yourself.' },
      { speaker: 'Sovereign', text: 'Rule 4 of Ashwander states the Court should not pass on constitutional questions if the case can be disposed of on other grounds. I am moving for dismissal on purely procedural grounds first.', note: 'This prevents them from labeling you "frivolous". You are asking for the "lesser" remedy.' },
      { speaker: 'Judge', text: 'What are those grounds?' },
      { speaker: 'Sovereign', text: 'Lack of verified proof of claim and failure to state a claim upon which relief can be granted. The statute (UCC/Common Law) is sufficient to dispose of this without reaching the Constitution.' }
    ]
  },
  {
    id: 'arraignment',
    title: 'Arraignment / First Appearance',
    script: [
      { speaker: 'Judge', text: 'State your name for the record.' },
      { speaker: 'Sovereign', text: 'I am here as the Authorized Representative for the all-caps name. I reserve all rights under UCC 1-308.', note: 'Do not just say the name. That creates Joinder.' },
      { speaker: 'Judge', text: 'Do you understand the charges?' },
      { speaker: 'Sovereign', text: 'I do not stand under anything. I accept the charges for value and return them for discharge upon proof of claim.', note: '"Understand" means "stand under" or submit to authority.' },
      { speaker: 'Judge', text: 'How do you plead?' },
      { speaker: 'Sovereign', text: 'I cannot enter a plea as that would grant jurisdiction. I move for the prosecution to verify the claim on the record.', note: 'Entering a plea (Guilty/Not Guilty) validates the court\'s jurisdiction.' }
    ]
  }
];

const CORE_PHRASES = [
  { phrase: "I reserve all my rights without prejudice (UCC 1-308).", context: "Use at the beginning of any interaction to prevent waiver of common law rights." },
  { phrase: "I do not consent, and I waive all benefits.", context: "Use when asked to sign something or agree to a procedure." },
  { phrase: "Is there a verified claim against me by a living man or woman?", context: "Use to expose that the 'Plaintiff' is a corporate fiction (e.g. STATE OF X)." },
  { phrase: "I am avoiding constitutional questions under Ashwander Rule 4.", context: "Use this to pivot back to procedure/statute if they say you are arguing 'frivolous' constitutional theories." },
  { phrase: "I am traveling, not driving.", context: "Driving is a commercial activity (transportation of goods/passengers). Traveling is a right." },
  { phrase: "Is the court seeking to convert a Right into a Privilege?", context: "Use when they insist you need a license to travel." }
];

const MAXIMS = [
  { 
    text: "Ignorantia juris non excusat", 
    trans: "Ignorance of the law excuses no one.", 
    app: "Use this against them. If they claim to not know the UCC or Common Law, remind them they are presumed to know." 
  },
  { 
    text: "Lex non cogit ad impossibilia", 
    trans: "The law does not compel the impossible.", 
    app: "If a statute requires you to perform an impossible act (like paying a debt with money that doesn't exist), the law is void." 
  },
  { 
    text: "Quod ab initio non valet, in tractu temporis non convalescit", 
    trans: "What is void from the beginning does not become valid by lapse of time.", 
    app: "A fraud (like the birth certificate contract) does not become valid just because you've used it for 30 years." 
  },
  { 
    text: "In commercio veritas", 
    trans: "Truth in commerce.", 
    app: "An unrebutted affidavit stands as truth in commerce. If they don't answer your affidavit, you win by default." 
  }
];

const ANCHORS = [
  {
    title: "Right to Travel",
    cite: "Shapiro v. Thompson, 394 U.S. 618 (1969)",
    text: "The Right to Travel is a part of the 'liberty' of which the citizen cannot be deprived without due process of law.",
    strategy: "Anchor your traffic defense here. It's not a privilege granted by the DMV; it's a fundamental liberty."
  },
  {
    title: "Conversion of Right to Crime",
    cite: "Murdock v. PA (319 U.S. 105) & Shuttlesworth v. Birmingham (394 U.S. 147)",
    text: "A State may not impose a charge for the enjoyment of a right granted by the Federal Constitution. If converted to a privilege, the law may be ignored with impunity.",
    strategy: "The 'Nuclear Option' for licensing. If they charge for a right, the law is void."
  },
  {
    title: "Due Process",
    cite: "Fifth & Fourteenth Amendments",
    text: "No person shall be deprived of life, liberty, or property, without due process of law.",
    strategy: "Taking your car (impound) without a court order and a verified injured party violates due process."
  }
];

const CourtroomConveyance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'phrases' | 'roleplay' | 'pleadings' | 'checklist' | 'resources'>('phrases');
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [scriptIndex, setScriptIndex] = useState(0);

  // Pleading State
  const [caseDetails, setCaseDetails] = useState({
    court: '',
    caseNumber: '',
    plaintiff: '',
    defendant: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState(PLEADING_TEMPLATES[0]);
  const [generatedPleading, setGeneratedPleading] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const nextLine = () => {
    if (scriptIndex < selectedScenario.script.length - 1) {
      setScriptIndex(scriptIndex + 1);
    }
  };

  const resetRoleplay = () => {
    setScriptIndex(0);
  };

  const handleGeneratePleading = async () => {
    setIsGenerating(true);
    try {
      const prompt = selectedTemplate.userPrompt(caseDetails);
      const text = await generateCustomDocument(selectedTemplate.systemPrompt, prompt);
      setGeneratedPleading(text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Gavel className="w-8 h-8 text-red-500" />
              Courtroom Conveyance
            </h2>
            <p className="text-slate-400 mt-2">
              Tactical scripts, traffic defense strategies, and constitutional anchoring.
            </p>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
             <button 
               onClick={() => setActiveTab('phrases')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'phrases' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <MessageSquare className="w-4 h-4" /> Phrases
             </button>
             <button 
               onClick={() => setActiveTab('roleplay')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'roleplay' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <Play className="w-4 h-4" /> Role-Play
             </button>
             <button 
               onClick={() => setActiveTab('pleadings')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'pleadings' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <FileText className="w-4 h-4" /> Pleadings
             </button>
             <button 
               onClick={() => setActiveTab('resources')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'resources' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <Landmark className="w-4 h-4" /> Deep Law
             </button>
             <button 
               onClick={() => setActiveTab('checklist')}
               className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'checklist' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               <CheckSquare className="w-4 h-4" /> Checklist
             </button>
          </div>
       </div>

       {/* --- PHRASES --- */}
       {activeTab === 'phrases' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CORE_PHRASES.map((item, idx) => (
              <div key={idx} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-red-500/40 transition-colors group">
                 <div className="flex items-start gap-3 mb-3">
                    <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <p className="text-lg font-bold text-white font-serif italic">"{item.phrase}"</p>
                 </div>
                 <div className="pl-9">
                    <p className="text-sm text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-red-400 font-bold text-xs uppercase mr-2">Context:</span>
                      {item.context}
                    </p>
                 </div>
              </div>
            ))}
         </div>
       )}

       {/* --- PLEADING GENERATOR --- */}
       {activeTab === 'pleadings' && (
         <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="w-full lg:w-1/3 space-y-6">
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase">Case Context</h3>
                  <input 
                    type="text" 
                    placeholder="Court (e.g. District Court of Travis County)" 
                    value={caseDetails.court}
                    onChange={e => setCaseDetails({...caseDetails, court: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                  <input 
                    type="text" 
                    placeholder="Case Number" 
                    value={caseDetails.caseNumber}
                    onChange={e => setCaseDetails({...caseDetails, caseNumber: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Plaintiff" 
                      value={caseDetails.plaintiff}
                      onChange={e => setCaseDetails({...caseDetails, plaintiff: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="Defendant" 
                      value={caseDetails.defendant}
                      onChange={e => setCaseDetails({...caseDetails, defendant: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm"
                    />
                  </div>
               </div>

               <div className="space-y-3">
                  {PLEADING_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${selectedTemplate.id === t.id ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}
                    >
                       <div className={`p-2 rounded ${selectedTemplate.id === t.id ? 'bg-red-500/20' : 'bg-slate-950'}`}>
                          {t.icon}
                       </div>
                       <div>
                          <h4 className={`font-bold ${selectedTemplate.id === t.id ? 'text-red-400' : 'text-slate-300'}`}>{t.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                       </div>
                    </button>
                  ))}
               </div>

               <button
                 onClick={handleGeneratePleading}
                 disabled={isGenerating || !caseDetails.court}
                 className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
               >
                 {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <PenTool className="w-4 h-4"/>}
                 Generate {selectedTemplate.title}
               </button>
            </div>

            <div className="flex-1 bg-slate-100 rounded-xl p-8 text-slate-900 overflow-y-auto relative shadow-2xl min-h-[600px]">
               <div className="absolute top-0 left-0 w-full h-12 bg-slate-200 border-b border-slate-300 flex items-center justify-between px-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Document Preview</span>
                  <div className="flex gap-2">
                    <button className="text-slate-500 hover:text-slate-800" title="Copy"><Copy className="w-4 h-4" /></button>
                    <button className="text-slate-500 hover:text-slate-800" title="Download"><Download className="w-4 h-4" /></button>
                  </div>
               </div>
               <div className="mt-8 font-serif text-sm leading-relaxed whitespace-pre-wrap">
                 {generatedPleading || (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none py-20">
                      <FileText className="w-16 h-16 mb-4 opacity-20" />
                      <p>Select a template and enter case details to generate your filing.</p>
                   </div>
                 )}
               </div>
            </div>
         </div>
       )}

       {/* --- RESOURCES / DEEP LAW --- */}
       {activeTab === 'resources' && (
         <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/2 space-y-4">
               <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                 <Scale className="w-5 h-5 text-amber-500" /> Legal Maxims
               </h3>
               {MAXIMS.map((m, i) => (
                 <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors">
                    <p className="text-lg font-serif text-amber-100 italic mb-1">{m.text}</p>
                    <p className="text-sm font-bold text-slate-400 mb-2">{m.trans}</p>
                    <div className="text-xs text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
                       <span className="text-amber-600 font-bold uppercase mr-1">Application:</span>
                       {m.app}
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="w-full lg:w-1/2 space-y-4">
               <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                 <Landmark className="w-5 h-5 text-indigo-500" /> Constitutional Anchors
               </h3>
               {ANCHORS.map((a, i) => (
                 <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="font-bold text-white">{a.title}</h4>
                       <span className="text-[10px] bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">{a.cite}</span>
                    </div>
                    <p className="text-sm text-slate-300 italic mb-3">"{a.text}"</p>
                    <div className="text-xs text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
                       <span className="text-indigo-500 font-bold uppercase mr-1">Strategy:</span>
                       {a.strategy}
                    </div>
                 </div>
               ))}
            </div>
         </div>
       )}

       {/* --- ROLE PLAY --- */}
       {activeTab === 'roleplay' && (
         <div className="flex-1 flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/4 bg-slate-900 rounded-xl border border-slate-800 p-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Scenarios</h3>
               <div className="space-y-2">
                 {SCENARIOS.map(s => (
                   <button
                     key={s.id}
                     onClick={() => { setSelectedScenario(s); setScriptIndex(0); }}
                     className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedScenario.id === s.id ? 'bg-red-900/20 text-red-200 border border-red-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'}`}
                   >
                     {s.title}
                   </button>
                 ))}
               </div>
               <div className="mt-6 p-4 bg-slate-950 rounded border border-slate-800">
                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Instructions</h4>
                 <p className="text-xs text-slate-400">Read the lines aloud. Click "Next Line" to advance. Pay close attention to the sovereign notes.</p>
               </div>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative flex flex-col overflow-hidden">
               <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
                  <div className="mb-8">
                     <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${selectedScenario.script[scriptIndex].speaker === 'Sovereign' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                        {selectedScenario.script[scriptIndex].speaker}
                     </span>
                  </div>
                  
                  <h2 className="text-3xl font-serif text-white leading-relaxed mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    "{selectedScenario.script[scriptIndex].text}"
                  </h2>

                  {selectedScenario.script[scriptIndex].note && (
                    <div className="max-w-lg bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg text-amber-200 text-sm animate-in fade-in delay-200">
                       <BookOpen className="w-4 h-4 inline-block mr-2 mb-0.5" />
                       <strong>Strategy:</strong> {selectedScenario.script[scriptIndex].note}
                    </div>
                  )}
               </div>

               <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                  <button 
                    onClick={resetRoleplay}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    title="Reset"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <div className="text-sm font-mono text-slate-500">
                    Line {scriptIndex + 1} / {selectedScenario.script.length}
                  </div>
                  <button 
                    onClick={nextLine}
                    disabled={scriptIndex === selectedScenario.script.length - 1}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Next Line <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
       )}

       {/* --- CHECKLIST --- */}
       {activeTab === 'checklist' && (
         <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4">Traffic & Court Delivery Checklist</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                   <Car className="w-4 h-4" /> Traffic Stop / License Rescission
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Notice of Rescission of Signature (Notarized)",
                    "Fee Schedule for Detainment ($100/min)",
                    "Copy of Shapiro v. Thompson Ruling",
                    "Do Not Detain List Entry (if applicable)",
                    "Dashcam / Audio Recorder Ready"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-950 rounded border border-slate-800 hover:border-slate-700">
                       <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center">
                         <div className="w-3 h-3 rounded bg-slate-800"></div>
                       </div>
                       <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                   <Gavel className="w-4 h-4" /> Court Appearance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Original Birth Certificate Bond (Authenticated)",
                    "Affidavit of Status filed with Clerk",
                    "Notice of Special Appearance (filed 3 days prior)",
                    "Mailing Address vs Domicile clarified",
                    "Script practiced and memorized",
                    "Recorder ready (if permitted)"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-950 rounded border border-slate-800 hover:border-slate-700">
                       <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center">
                         <div className="w-3 h-3 rounded bg-slate-800"></div>
                       </div>
                       <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default CourtroomConveyance;
