
import { Creditor, UserProfile, Template, IdentityProfile, InstrumentData, CallScript, RemedyProcess, CommercialInvoice } from '../types';

export interface VaultDocument {
  id: string;
  type: string;
  name: string; // Filename or Document Name
  metadata: any; // The extracted JSON from Gemini
  dateUploaded: string;
}

const STORAGE_KEY = 'verobrix_vault_data';
const PROFILE_KEY = 'verobrix_user_profile';
const IDENTITY_KEY = 'verobrix_identity_profile';
const CREDITORS_KEY = 'verobrix_creditors';
const TEMPLATES_KEY = 'verobrix_templates';
const CLIPBOARD_KEY = 'verobrix_clipboard_instrument';
const SCRIPTS_KEY = 'verobrix_call_scripts';
const REMEDY_PROCESS_KEY = 'verobrix_remedy_processes';
const INVOICES_KEY = 'verobrix_invoices';

// --- Clipboard (Passing Data) ---
export const saveToClipboard = (data: InstrumentData) => {
  localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
};

export const getFromClipboard = (): InstrumentData | null => {
  try {
    const data = localStorage.getItem(CLIPBOARD_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const clearClipboard = () => {
  localStorage.removeItem(CLIPBOARD_KEY);
};

// --- Vault Storage ---

export const saveDocumentToVault = async (docData: Omit<VaultDocument, 'id' | 'dateUploaded'>): Promise<VaultDocument> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Sim delay
  const currentDocs = getDocumentsFromVault();
  const newDoc: VaultDocument = {
    ...docData,
    id: crypto.randomUUID(),
    dateUploaded: new Date().toISOString()
  };
  currentDocs.push(newDoc);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDocs));
  return newDoc;
};

export const getDocumentsFromVault = (): VaultDocument[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Storage read error", e);
    return [];
  }
};

export const deleteDocumentFromVault = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const currentDocs = getDocumentsFromVault();
  const updatedDocs = currentDocs.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));
};

// --- User Profile ---

export const getUserProfile = (): UserProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const clearUserProfile = () => {
  localStorage.removeItem(PROFILE_KEY);
};

// --- Identity Profile ---

export const getIdentityProfile = (): IdentityProfile | null => {
  try {
    const data = localStorage.getItem(IDENTITY_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveIdentityProfile = (profile: IdentityProfile) => {
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(profile));
};

// --- Creditor Book ---

export const getCreditors = (): Creditor[] => {
  try {
    const data = localStorage.getItem(CREDITORS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveCreditor = (creditor: Creditor) => {
  const list = getCreditors();
  list.unshift(creditor);
  localStorage.setItem(CREDITORS_KEY, JSON.stringify(list));
};

export const removeCreditor = (id: string) => {
  const list = getCreditors().filter(c => c.id !== id);
  localStorage.setItem(CREDITORS_KEY, JSON.stringify(list));
};

// --- Remedy Processes (Administrative Tracker) ---

export const getRemedyProcesses = (): RemedyProcess[] => {
  try {
    const data = localStorage.getItem(REMEDY_PROCESS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};

export const saveRemedyProcess = (process: RemedyProcess) => {
  const list = getRemedyProcesses();
  // Update if exists, else push
  const index = list.findIndex(p => p.id === process.id);
  if (index >= 0) {
    list[index] = process;
  } else {
    list.unshift(process);
  }
  localStorage.setItem(REMEDY_PROCESS_KEY, JSON.stringify(list));
};

export const deleteRemedyProcess = (id: string) => {
  const list = getRemedyProcesses().filter(p => p.id !== id);
  localStorage.setItem(REMEDY_PROCESS_KEY, JSON.stringify(list));
};

// --- Commercial Invoices (Fee Enforcer) ---

export const getInvoices = (): CommercialInvoice[] => {
  try {
    const data = localStorage.getItem(INVOICES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};

export const saveInvoice = (invoice: CommercialInvoice) => {
  const list = getInvoices();
  list.unshift(invoice);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(list));
};

// --- Template Library ---

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-treaty-motion',
    name: 'Treaty Invocation & Supremacy Motion',
    description: 'Invoke Federal Question jurisdiction via Article VI and the Treaty of Peace and Friendship (1787).',
    systemInstruction: 'You are a Federal Rights Litigator. Draft a formal "Motion for Judicial Notice and Dismissal for Lack of Jurisdiction". The argument must anchor on the Supremacy Clause (Article VI) and the Treaty of Peace and Friendship (1787), asserting that state statutes cannot impair the obligation of this contract.',
    userPromptTemplate: 'Draft a motion for the following venue:\nCourt: {{courtName}}\nCase No: {{caseNumber}}\n\nAssert that the "Defendant" is a non-citizen national protected by Treaty. Demand dismissal of the state action for lack of subject matter jurisdiction.',
    isCustom: false
  },
  {
    id: 'tpl-vital-req',
    name: 'Vital Records Request (Specific)',
    description: 'Request long-form BC with specific demand for registration numbers/file numbers.',
    systemInstruction: 'You are an administrative law specialist. Draft a precise request for public records.',
    userPromptTemplate: 'Draft a request to {{agencyName}} for the birth record of {{name}} (DOB: {{dob}}). Demand inclusion of the registration number, file number, and all registrar annotations. Include a clause demanding written policy citations if any data is redacted.',
    isCustom: false
  },
  {
    id: 'tpl-admin-denial',
    name: 'Demand for Authority (Denial Appeal)',
    description: 'Use when an agency says "that number does not exist" or "privacy prevents release".',
    systemInstruction: 'You are an appellate specialist. Draft a formal demand for statutory authority.',
    userPromptTemplate: 'Draft a response to a denial from {{agencyName}}. They refused to provide {{recordType}}. Demand the specific statute, administrative rule, or written policy relied upon for this denial. Request the name of the Records Custodian and the formal appeal process.',
    isCustom: false
  },
  {
    id: 'tpl-1',
    name: 'Notice of Conditional Acceptance',
    description: 'Accept a presentment conditionally upon proof of claim.',
    systemInstruction: 'You are a Sovereign Legal Expert. Draft a formal Notice of Conditional Acceptance. Use authoritative, archaic commercial language.',
    userPromptTemplate: 'Draft a conditional acceptance for the following claim: {{claimDetails}}. Claimant: {{claimantName}}.',
    isCustom: false
  },
  {
    id: 'tpl-2',
    name: 'Affidavit of Truth',
    description: 'General affidavit to establish facts on the public record.',
    systemInstruction: 'You are a scribe for a Secured Party Creditor. Draft an Affidavit of Truth formatted with a Jurat.',
    userPromptTemplate: 'Draft an affidavit stating the following facts: {{facts}}.',
    isCustom: false
  },
  {
    id: 'tpl-3',
    name: 'Freedom of Information Act Request',
    description: 'Request specific agency records.',
    systemInstruction: 'You are a Transparency Advocate. Draft a precise FOIA request.',
    userPromptTemplate: 'Draft a FOIA request to {{agencyName}} regarding {{subject}}.',
    isCustom: false
  },
  {
    id: 'tpl-ucc-1',
    name: 'UCC-1 Financing Statement Guide',
    description: 'Draft the content for a standard UCC-1 financing statement.',
    systemInstruction: 'You are an expert in Uniform Commercial Code Article 9. Draft the precise text fields for a UCC-1 Financing Statement. Ensure the Collateral Description is maximalist and sovereign-oriented.',
    userPromptTemplate: 'Draft UCC-1 content.\nSecured Party: {{securedParty}}\nDebtor: {{debtor}}\nCollateral: {{collateralDescription}}',
    isCustom: false
  },
  {
    id: 'tpl-ucc-3',
    name: 'UCC-3 Amendment Guide',
    description: 'Draft amendments, assignments, or terminations for existing filings.',
    systemInstruction: 'You are a UCC Specialist. Draft a UCC-3 Amendment text. Clearly specify whether this is a Termination, Assignment, or Amendment of Collateral.',
    userPromptTemplate: 'Draft UCC-3 Amendment.\nOriginal File Number: {{fileNumber}}\nAmendment Type: {{type: Termination/Assignment}}\nDetails: {{details}}',
    isCustom: false
  },
  {
    id: 'tpl-ucc-5',
    name: 'UCC-5 Information Statement',
    description: 'File an objection or correction to a record indexed under your name.',
    systemInstruction: 'You are a Commercial Law expert. Draft a UCC-5 Information Statement to correct or object to a potentially fraudulent or inaccurate record.',
    userPromptTemplate: 'Draft UCC-5 Statement.\nRecord Corrected: {{recordReference}}\nReason for Correction/Objection: {{reason}}',
    isCustom: false
  },
  {
    id: 'tpl-promissory',
    name: 'Sovereign Promissory Note',
    description: 'Draft a negotiable instrument backed by the Private Trust.',
    systemInstruction: 'You are a specialist in UNCITRAL conventions and International Bills of Exchange. Draft a legally sound Promissory Note. Ensure it contains the unconditional promise to pay, fixed sum, and signature block for the Trustee.',
    userPromptTemplate: 'Draft Promissory Note.\nMaker (Trust): {{trustName}}\nTrustee: {{trusteeName}}\nPayee: {{payeeName}}\nAmount: {{amount}}\nMaturity Date: {{date}}\nJurisdiction: {{situs}}',
    isCustom: false
  }
];

export const getTemplates = (): Template[] => {
  try {
    const saved = localStorage.getItem(TEMPLATES_KEY);
    const customTemplates = saved ? JSON.parse(saved) : [];
    return [...DEFAULT_TEMPLATES, ...customTemplates];
  } catch (e) {
    return DEFAULT_TEMPLATES;
  }
};

export const saveTemplate = (template: Template) => {
  const saved = localStorage.getItem(TEMPLATES_KEY);
  const list = saved ? JSON.parse(saved) : [];
  list.push(template);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
};

export const deleteCustomTemplate = (id: string) => {
  const saved = localStorage.getItem(TEMPLATES_KEY);
  if (!saved) return;
  const list = JSON.parse(saved) as Template[];
  const updated = list.filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
};

// --- TeleCounsel Scripts ---

const DEFAULT_SCRIPTS: CallScript[] = [
  {
    id: 'script-vr-inquiry',
    title: 'Vital Records - "No Such Number"',
    description: 'Use when a clerk claims the registration number or CUSIP link does not exist or is private.',
    tags: ['Vital Records', 'Gatekeeping', 'Privacy'],
    steps: [
      {
        label: 'The Request',
        text: 'I am requesting a certified long-form birth certificate. Please ensure it includes the full registration number, local file number, and date registered.',
        guidance: 'State this clearly. Do not mention trusts or money yet.'
      },
      {
        label: 'The Resistance',
        text: 'If you are saying that number does not exist or is private, please provide the specific statutory citation your office uses to exclude that information from a certified copy.',
        guidance: 'Wait for them to fumble. They usually cite "policy", not law.'
      },
      {
        label: 'The Escalation',
        text: 'I understand you are following procedure. However, I require a written denial citing the specific statute for non-disclosure, along with the name of the Records Custodian and the appeal process.',
        guidance: 'Move from asking to building an administrative record.'
      }
    ],
    objections: [
      { trigger: 'We don\'t know what you mean', response: 'I am referring to the file number used to index this document in your state system.' },
      { trigger: 'That is internal only', response: 'Is there a statute that classifies the index number as confidential? If so, please cite it.' }
    ]
  },
  {
    id: 'script-ucc-reject',
    title: 'Filing Officer - Rejection',
    description: 'Use when a filing office rejects a UCC-1 claiming it is "frivolous" or attempts to verify the collateral.',
    tags: ['UCC', 'Filing Office', 'Rejection'],
    steps: [
      {
        label: 'Opening',
        text: 'I am calling regarding Rejection Notice [Number]. The rejection states the filing is [Reason].',
        guidance: 'Stay calm. You are merely inquiring about the administrative process.'
      },
      {
        label: 'Ministerial Duty',
        text: 'Under UCC Article 9, the filing office\'s role is ministerial. You are required to file if the form is communicated and the fee is tendered. Are you making a legal determination on the validity of the collateral?',
        guidance: 'Filing officers cannot make legal judgments, only format checks.'
      },
      {
        label: 'Demand Policy',
        text: 'If you are refusing to file based on content, please provide the written policy or administrative rule that authorizes you to review the substance of the collateral description.',
        guidance: 'They often cannot produce this. It puts them on notice.'
      }
    ],
    objections: [
      { trigger: 'We don\'t accept filings on people', response: 'This is a filing regarding a commercial entity and its assets, grounded in a security agreement.' },
      { trigger: 'It looks like a sovereign citizen filing', response: 'I cannot speak to that. I am asking for the specific UCC regulation that was violated.' }
    ]
  },
  {
    id: 'script-1',
    title: 'Debt Collector Validation',
    description: 'Initial contact script for third-party debt collectors. Focuses on preventing joinder and demanding verification.',
    tags: ['Debt', 'FDCPA', 'Collections'],
    steps: [
      {
        label: 'Identify & Record',
        text: 'Before we proceed, I am the Authorized Representative for the all-caps name on your file. I am recording this call for quality assurance and accurate record keeping. Do you consent to being recorded?',
        guidance: 'If they say no, state: "Then I cannot proceed with this call." and hang up.'
      },
      {
        label: 'Establish Authority',
        text: 'What is your full name, and do you have a license to collect debts in my state?',
        guidance: 'Write down their name and ID number immediately.'
      },
      {
        label: 'Demand Verification',
        text: 'I dispute this debt in its entirety. I am not refusing to pay, but I require proof of claim. Please send a certified copy of the original contract bearing my wet-ink signature.',
        guidance: 'Do not admit the debt is yours. Use the phrase "alleged debt".'
      },
      {
        label: 'Close Call',
        text: 'Until you provide that verification in writing, you are to cease all telephone communication. This is a verbal Cease and Desist under FDCPA Section 805(c). Good day.',
        guidance: 'Hang up immediately after stating this.'
      }
    ],
    objections: [
      { trigger: 'We need payment now', response: 'I cannot tender payment on an unverified debt. That would be irresponsible.' },
      { trigger: 'Are you refusing to pay?', response: 'I am not refusing. I am conditionally accepting your claim upon proof of verification.' },
      { trigger: 'Verify your SSN', response: 'I do not give out private information over the unsecured telephone line.' }
    ]
  },
  {
    id: 'script-2',
    title: 'Credit Card Inquiry',
    description: 'Speaking to a bank representative regarding ledger accounting or billing errors.',
    tags: ['Banking', 'Credit', 'Ledger'],
    steps: [
      {
        label: 'Opening',
        text: 'Hello, I am calling regarding account ending in [Last 4]. I am inquiring about the accounting ledger associated with this account.',
        guidance: 'Be polite but firm. You are the beneficiary of the trust account.'
      },
      {
        label: 'The Inquiry',
        text: 'I noticed a charge on [Date] for [Amount]. Can you please verify if this was an extension of credit or an exchange of funds?',
        guidance: 'This confuses standard reps, but establishes you know banking mechanics.'
      },
      {
        label: 'Escalation',
        text: 'I understand you may not have access to that level of detail. Please transfer me to the Fraud Department or a Supervisor who can view the transaction ledger.',
        guidance: 'Standard CSRs strictly follow scripts. Move up the chain.'
      }
    ],
    objections: [
      { trigger: 'I cannot transfer you', response: 'Please note on the account that I requested a supervisor and was denied.' },
      { trigger: 'What is the issue?', response: 'The issue involves the accounting methodology used for this transaction.' }
    ]
  }
];

export const getCallScripts = (): CallScript[] => {
  try {
    const saved = localStorage.getItem(SCRIPTS_KEY);
    const custom = saved ? JSON.parse(saved) : [];
    return [...DEFAULT_SCRIPTS, ...custom];
  } catch (e) {
    return DEFAULT_SCRIPTS;
  }
};

export const saveCallScript = (script: CallScript) => {
  const saved = localStorage.getItem(SCRIPTS_KEY);
  const list = saved ? JSON.parse(saved) : [];
  list.push(script);
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(list));
};
