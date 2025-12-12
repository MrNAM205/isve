
export interface SemanticAnalysisResult {
  summary: string;
  traps: string[];
  jurisdiction_claimed: string;
  rebuttal_strategy: string;
  suggested_affidavit_points: string[];
}

export interface InstrumentData {
  creditor_name: string;
  account_number: string;
  amount_due: string;
  past_due_amount?: string;
  statement_date: string;
  due_date?: string;
  payment_address: string; // General address
  remit_address?: string; // Specific coupon/payment address
  fdcpa_violations: string[];
  is_payment_coupon?: boolean;
  coupon_amount?: string;
}

export interface CreditDisputeItem {
  creditor: string;
  account_number: string;
  reason: string;
  date: string;
}

export interface CreditReportAnalysis {
  bureau: string;
  score: string;
  negative_items: CreditDisputeItem[];
  personal_info_errors: string[];
}

export interface GenerationResult {
  document_text: string;
  model_used: string;
}

export interface Creditor {
  id: string;
  name: string;
  address: string;
  accountNumber: string;
  status: 'Active' | 'Disputed' | 'Discharged';
}

export interface TILAAnalysisResult {
  aprValid: boolean;
  financeChargeValid: boolean;
  hiddenFeesFound: string[];
  remedyGuidance: string;
}

export interface FDCPAViolation {
  id: string;
  debtCollector: string;
  violationType: string;
  date: string;
  details: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: 'google' | 'github';
}

export interface IdentityProfile {
  legalName: string;
  livingName: string;
  dateOfBirth: string;
  mailingAddress: string; // Postal/Deliverable
  domicileDeclaration: string; // Sovereign/Land Jurisdiction
  email: string;
  phoneNumber: string;
  taxId: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  userPromptTemplate: string;
  isCustom: boolean;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  source?: string;
  sovereign_note?: string;
}

export interface RegistryResult {
  fileNumber: string;
  debtor: string;
  securedParty: string;
  dateFiled: string;
  status: 'Perfected' | 'Unperfected' | 'Lapsed';
  collateralSummary: string;
}

export interface CryptoKeys {
  publicKey: string; // Exported JWK or PEM string
  privateKey: CryptoKey; // Kept in memory/indexedDB (not displayed)
}

export interface ScriptStep {
  label: string;
  text: string;
  guidance?: string;
}

export interface ObjectionHandler {
  trigger: string;
  response: string;
}

export interface CallScript {
  id: string;
  title: string;
  description: string;
  steps: ScriptStep[];
  objections: ObjectionHandler[];
  tags: string[];
}

export interface Statute {
  id: string;
  title: string;
  citation: string;
  fullText: string;
  riskAnalysis: {
    frictionLevel: 'Low' | 'Medium' | 'High';
    mainstreamView: string;
    sovereignView: string;
  };
}

export interface StatuteAnnotation {
  id: string;
  statuteId: string;
  text: string;
  date: string;
}

export interface AccordData {
  creditorName: string;
  accountNumber: string;
  amount: string;
  instrumentNumber: string; // Check or Money Order #
  tenderDate: string;
}

// --- NEW REMEDY TYPES ---

export interface RemedyProcess {
  id: string;
  respondent: string;
  subject: string;
  startDate: string;
  status: 'Step 1: Inquiry' | 'Step 2: Fault' | 'Step 3: Default' | 'Complete';
  nextActionDate: string; // ISO Date
  certifiedMailNumbers: string[];
}

export interface CommercialInvoice {
  id: string;
  violator: string;
  violationType: string; // Trespass, Copyright, Harassment
  date: string;
  amount: string;
  invoiceNumber: string;
  status: 'Sent' | 'Past Due' | 'Liened';
}

export type NotificationType = 'success' | 'error' | 'info';

export type NotifyFn = (type: NotificationType, message: string) => void;
