
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

// --- App-specific UI Types ---

export type Tab = 'dashboard' | 'document-vault' | 'semantic-scanner' | 'instrument-parser' | 'status-correction' | 'a4v-tender' | 'ucc-filing' | 'creditor-book' | 'legal-resources' | 'fcra-dispute' | 'templates' | 'identity-profile' | 'endorsement-allonge' | 'tele-counsel' | 'trust-builder' | 'name-guard' | 'filing-navigator' | 'courtroom-conveyance' | 'remedy-tracker';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
}

export interface DraftDisputeData {
  disputeItem?: string;
}

// --- Gemini Service Data Types ---

export interface GenerateAffidavitData {
  legalName: string;
  livingName: string;
  dob: string;
  jurisdiction?: string;
}

export interface GenerateA4VData {
  creditorName: string;
  accountNumber: string;
  amount: string;
  taxId: string;
}

export interface GenerateFCRADisputeData {
  name: string;
  address: string;
  disputeItem: string;
}

export interface GenerateCeaseDesistData {
  collector: string;
  userName: string;
}

export interface DraftUCC1Data {
  securedParty: string;
  securedPartyAddress: string;
  debtorName: string;
  debtorAddress: string;
  collateralDescription?: string;
}

export interface GenerateAllongeData {
  accountNumber: string;
  creditorName: string;
  amount: string;
  type: string;
  signerName: string;
  includeNotary: boolean;
  digitalSignature?: string;
}

export interface GenerateTrustIndentureData {
  trustName: string;
  grantor: string;
  trustee: string;
  beneficiary: string;
  situs: string;
  dateCreated: string;
}

export interface GenerateAssetAssignmentData {
  grantor: string;
  trustName: string;
  trustee: string;
  assetDescription: string;
  bondNumber?: string;
  includeCopyright: boolean;
  feeSchedule?: string;
}

export interface GenerateCopyrightNoticeData {
  owner: string;
  tradename: string;
  registrationDate: string;
  feeSchedule: string;
}

export interface GenerateRestrictiveEndorsementData {
  instrumentNumber: string;
  accountNumber: string;
}

export interface GenerateAccordLetterData {
  creditorName: string;
  accountNumber: string;
  instrumentNumber: string;
  amount: string;
}

export interface GenerateSovereignNoteData {
  trustName: string;
  trustee: string;
  payee: string;
  amount: string;
  currency: string;
  maturityDate: string;
  jurisdiction: string;
}

export interface GenerateAdminNoticeData {
  respondent: string;
  subject: string;
  sender: string;
  previousDate?: string;
}

export interface GenerateInvoiceData {
  violator: string;
  sender: string;
  invoiceNumber: string;
  date: string;
  violationType: string;
  amount: string;
}

export interface GenerateRescissionNoticeData {
  agency: string;
  reason: string;
  refNumber: string;
}

export interface DialogosAnalysisResult {
  summary: string;
  riskAnalysis: {
    term: string;
    conventionalDefinition: string;
    alternativeInterpretation: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    rationale: string;
  }[];
}

export interface IdentityDocumentData {
  documentType: "Birth Certificate" | "Drivers License" | "Social Security Card" | "Passport" | "Other";
  fullName: string;
  dateOfBirth: string;
  documentNumber: string;
  issuingStateOrAuthority: string;
  expirationDate?: string;
  address?: string;
}

export interface CorpusItem {
  id?: number; // Optional: auto-incrementing key from IndexedDB
  Source: 'Constitution' | 'Statute' | 'Rule' | 'Treaty';
  Jurisdiction: 'Federal' | 'State' | 'International';
  EffectiveDate?: string;
  Citation: string;
  RuleNumber_Section?: string;
  Title: string;
  Text: string;
  StrategicNotes?: string;
}
