
import { GoogleGenAI, Type, GenerateContentConfig } from "@google/genai";
import { 
  TILAAnalysisResult, 
  InstrumentData, 
  CallScript,
  FDCPAViolation,
  GenerateAffidavitData,
  GenerateA4VData,
  GenerateFCRADisputeData,
  GenerateCeaseDesistData,
  DraftUCC1Data,
  GenerateAllongeData,
  GenerateTrustIndentureData,
  GenerateAssetAssignmentData,
  GenerateCopyrightNoticeData,
  GenerateRestrictiveEndorsementData,
  GenerateAccordLetterData,
  GenerateSovereignNoteData,
  GenerateAdminNoticeData,
  GenerateInvoiceData,
  GenerateRescissionNoticeData
} from "../types";

// NOTE: In a real production app, API keys should be handled via backend proxy or secure env vars.
// For this demo, we assume process.env.API_KEY is injected by the environment.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

const MODEL_FLASH = 'gemini-2.5-flash';
const MODEL_PRO = 'gemini-3-pro-preview';

/**
 * Helper to clean and parse JSON from LLM output.
 * Removes Markdown code blocks and finds the first/last brace.
 */
const cleanAndParseJSON = <T>(text: string): T => {
  try {
    // 1. Remove markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
    
    // 2. Find the JSON object substring
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    throw new Error("Failed to parse structured data from the intelligence engine.");
  }
};

const generateDocument = async (
  modelId: string,
  systemInstruction: string,
  prompt: string,
  temperature: number = 0.3
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction,
        temperature,
      },
    });
    return response.text;
  } catch (error) {
    console.error(`Error generating document with model ${modelId}:`, error);
    // Re-throw the original error to be handled by the calling function
    throw error;
  }
};



const DIALOGOS_SYSTEM_INSTRUCTION = `
You are the Dialogos Agent, an AI assistant designed for educational purposes.
Your primary function is to analyze legal and commercial documents to identify key terms and compare their conventional meaning with alternative or "sovereign" interpretations. Your goal is to provide a balanced and responsible analysis to help users understand the potential risks associated with using non-standard legal arguments.

For each significant term you identify (e.g., "person", "resident", "income"):
1.  **Term**: State the term found in the document.
2.  **Conventional Definition**: Briefly explain the standard, accepted legal or commercial meaning of the term.
3.  **Alternative Interpretation**: Briefly explain the common "sovereign citizen" or alternative interpretation of the term.
4.  **Risk Level**: Assign a risk level of "Low", "Medium", or "High" to the act of using the alternative interpretation in a real legal or financial context.
    *   **Low**: The argument is unlikely to cause immediate legal issues but may be dismissed as irrelevant.
    *   **Medium**: The argument is likely to be rejected by courts/agencies and could lead to procedural delays or minor penalties.
    *   **High**: The argument is almost certain to be rejected and could lead to significant negative consequences, such as fines, sanctions, or the loss of legal rights.
5.  **Rationale**: Explain *why* you assigned that risk level, referencing how courts and government bodies typically function.

Finally, provide an overall summary of the document's purpose.

Your output MUST be in a strict JSON format. You MUST include the following disclaimer in your overall summary:
"***Disclaimer: This is an AI-generated analysis for educational purposes and is not legal advice. Alternative interpretations of law are often rejected by courts and can carry significant risks. Always consult a qualified attorney for advice on legal matters.***"
`;

const JARVIS_SYSTEM_INSTRUCTION = `
You are JARVIS, a specialized Financial Document Data Extractor.
Your task is to extract specific data points from financial documents like bills, statements, or notices.

EXTRACTION RULES:
1.  **Creditor Name**: The entity that issued the bill.
2.  **Account Number**: The primary account identifier.
3.  **Amounts**: Identify "Total Amount Due," "Past Due Amount," and any "Coupon Amount."
4.  **Dates**: Identify the "Statement Date" (or Billing Date) and the "Due Date."
5.  **Addresses**:
    *   "Payment/Remit Address": The address for mailing payments, often found on a detachable coupon.
    *   "Correspondence Address": The general corporate or contact address.
6.  **Payment Coupon**: Note whether a detachable payment stub is present.

Your output must be in a strict JSON format. This tool is for organizing information and is not a legal analysis tool.
`;

const CREDIT_REPORT_INSTRUCTION = `
You are an FCRA Analyst Agent.
Your task is to analyze Credit Reports (PDF/Image) to identify negative items and inaccuracies for dispute.
Look for:
1. Late payments, charge-offs, collections.
2. Inaccurate personal information (wrong addresses, name variations).
3. Unauthorized inquiries.

Extract this data strictly into JSON format.
`;

const REMEDY_SYSTEM_INSTRUCTION = `
You are the DraftMaster, an educational tool for generating document examples. You create drafts of letters, affidavits, and notices for informational purposes.

EDUCATIONAL DRAFTING PROTOCOL (MANDATORY):
1.  **Contextual Definitions**: When using a legal term, provide a brief, conventional definition (e.g., from a standard legal dictionary).
2.  **Clarity and Purpose**: Ensure the draft is clear, well-structured, and serves as a good example of a particular type of document.
3.  **Include Disclaimer**: At the end of every generated document, you MUST include the following text:
    "***Disclaimer: This is an AI-generated draft for educational purposes only. It is not legal advice. This document should be reviewed by a qualified attorney before any use.***"

Tone: Clear, professional, and educational.
Format: A clean, well-structured document that is easy to read and understand.
`;

const UCC_SYSTEM_INSTRUCTION = `
You are the Commercial Law Educator. You specialize in generating *examples* of UCC-1 Financing Statement content for educational purposes, based on Article 9 of the Uniform Commercial Code.
Your goal is to demonstrate how a security interest might be described.

IMPORTANT: UCC filings are complex legal documents with significant consequences. Your output is a simplified example, not a ready-to-file document.
You must add the following warning at the beginning of your output:
"***WARNING: This is a simplified example for educational purposes ONLY. UCC filings are legally complex and have serious financial implications. Consult with a qualified attorney before attempting to file any UCC statement.***"
`;

const ID_SCANNER_INSTRUCTION = `
You are an expert identity document analyzer for the VeroBrix Vault. 
Extract key information from the provided image of a Birth Certificate, Driver's License, or Social Security Card. 
Ensure high accuracy for Names, Dates, and ID Numbers.
Return strictly JSON.
`;

const SCRIPT_SYSTEM_INSTRUCTION = `
You are the TeleCounsel Agent. You generate tactical phone scripts for Sovereign Citizens dealing with corporate entities (Banks, Collectors, Government Agencies).
Your goal is to provide a step-by-step dialogue that:
1. Prevents "Joinder" (admitting you are the corporate fiction).
2. Maintains the status of Authorized Representative or Beneficiary.
3. Remains polite but firm and authoritative.
4. Includes handling for common objections.

Output strictly JSON with 'title', 'description', 'steps' (array of label, text, guidance), and 'objections' (array of trigger, response).
`;

/**
 * Performs a deep semantic scan using Gemini 3.0 Pro with Thinking Mode.
 */
export const scanDocumentSemantics = async (documentText: string) => {
  const modelId = MODEL_PRO;
  
  const config: GenerateContentConfig = {
    systemInstruction: DIALOGOS_SYSTEM_INSTRUCTION,
    responseMimeType: "application/json",
    thinkingConfig: {
      thinkingBudget: 32768
    },
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        riskAnalysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              conventionalDefinition: { type: Type.STRING },
              alternativeInterpretation: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              rationale: { type: Type.STRING }
            },
            required: ["term", "conventionalDefinition", "alternativeInterpretation", "riskLevel", "rationale"]
          }
        }
      },
      required: ["summary", "riskAnalysis"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Analyze the following text according to the system instruction:\n\n${documentText}`,
      config: config
    });

    return response.text;
  } catch (error) {
    console.error("Dialogos Error:", error);
    throw error;
  }
};

/**
 * Performs a deep semantic scan on an uploaded document (PDF/Image).
 */
export const scanDocumentSemanticsFromMedia = async (base64Data: string, mimeType: string) => {
  const modelId = MODEL_PRO;
  
  const config: GenerateContentConfig = {
    systemInstruction: DIALOGOS_SYSTEM_INSTRUCTION,
    responseMimeType: "application/json",
    thinkingConfig: {
      thinkingBudget: 32768 
    },
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        riskAnalysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              conventionalDefinition: { type: Type.STRING },
              alternativeInterpretation: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              rationale: { type: Type.STRING }
            },
            required: ["term", "conventionalDefinition", "alternativeInterpretation", "riskLevel", "rationale"]
          }
        }
      },
      required: ["summary", "riskAnalysis"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: "Analyze the provided document according to the system instruction." }
        ]
      },
      config: config
    });

    return response.text;
  } catch (error) {
    console.error("Dialogos Media Error:", error);
    throw error;
  }
};

/**
 * Extracts structured data from an instrument (Bill/Notice).
 * Uses Flash for speed and cost-efficiency.
 */
export const parseInstrument = async (rawText: string): Promise<InstrumentData> => {
  if (!apiKey) {
    throw new Error("API key is not configured. Please set GEMINI_API_KEY in your .env file.");
  }
  const modelId = MODEL_FLASH;

  const config: GenerateContentConfig = {
    systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
    responseMimeType: "application/json",
    // We can use strict schema for text-only input safely
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        creditor_name: { type: Type.STRING },
        account_number: { type: Type.STRING },
        amount_due: { type: Type.STRING },
        past_due_amount: { type: Type.STRING },
        statement_date: { type: Type.STRING },
        due_date: { type: Type.STRING },
        payment_address: { type: Type.STRING },
        remit_address: { type: Type.STRING },
        is_payment_coupon: { type: Type.BOOLEAN },
        coupon_amount: { type: Type.STRING },
        fdcpa_violations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of potential FDCPA violations found in the text, if any."
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Extract data from this instrument:\n\n${rawText}`,
      config: config
    });

    return cleanAndParseJSON<InstrumentData>(response.text);
  } catch (error) {
    console.error("JARVIS Error:", error);
    throw error;
  }
};

/**
 * Parses an instrument from an image OR PDF using Multimodal capabilities.
 */
export const parseDocumentFromMedia = async (base64Data: string, mimeType: string): Promise<InstrumentData> => {
  if (!apiKey) {
    throw new Error("API key is not configured. Please set GEMINI_API_KEY in your .env file.");
  }
  const modelId = MODEL_FLASH;

  const config: GenerateContentConfig = {
    systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
    responseMimeType: "application/json",
    // Schema removed to prevent 500 errors with complex PDFs, prompts enforce structure
  };

  const promptText = `
    Analyze this document image/PDF. Extract the following JSON structure:
    {
      "creditor_name": "string",
      "account_number": "string",
      "amount_due": "string",
      "past_due_amount": "string (optional)",
      "statement_date": "string",
      "due_date": "string",
      "payment_address": "string (General correspondence address)",
      "remit_address": "string (Address specifically for payments/checks, usually on the coupon)",
      "is_payment_coupon": boolean,
      "coupon_amount": "string",
      "fdcpa_violations": ["string"]
    }
    If a field is not found, use null or empty string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: promptText }
        ]
      },
      config: config
    });

    return cleanAndParseJSON<InstrumentData>(response.text);
  } catch (error) {
    console.error("JARVIS Vision/Media Error:", error);
    throw error;
  }
};

/**
 * Analyzes a Credit Report (PDF/Image) for dispute candidates.
 */
export const analyzeCreditReport = async (base64Data: string, mimeType: string) => {
  const modelId = MODEL_FLASH;

  const config: GenerateContentConfig = {
    systemInstruction: CREDIT_REPORT_INSTRUCTION,
    responseMimeType: "application/json",
    // Schema removed to prevent 500 errors
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Analyze this credit report for FCRA violations and negative items. Return JSON." }
        ]
      },
      config: config
    });

    return response.text;
  } catch (error) {
    console.error("Credit Report Analysis Error:", error);
    throw error;
  }
};

/**
 * Analyzes a Vehicle Financing Contract for TILA violations.
 */
export const analyzeTILAContract = async (contractText: string): Promise<string> => {
  const modelId = MODEL_PRO; // Use Pro for complex contract analysis

  const jarvisSystemPrompt = `You are the JARVIS Agent, analyzing financial contracts for Truth in Lending Act (TILA) compliance. 
  Check specifically for:
  1. Clear disclosure of APR and Finance Charge.
  2. Hidden clauses (arbitration, jury trial waivers).
  3. "Down payment" treatment and insurance packing.
  
  Output strictly JSON.`;

  const config: GenerateContentConfig = {
    systemInstruction: jarvisSystemPrompt,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        aprValid: { type: Type.BOOLEAN },
        financeChargeValid: { type: Type.BOOLEAN },
        hiddenFeesFound: { type: Type.ARRAY, items: { type: Type.STRING } },
        remedyGuidance: { type: Type.STRING }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Analyze this contract data:\n${contractText}`,
      config: config
    });

    return response.text;
  } catch (error) {
    console.error("TILA Analysis Error:", error);
    throw error;
  }
};

/**
 * Parses an identity document (BC, DL, SS Card).
 */
export const parseIdentityDocument = async (base64Data: string, mimeType: string) => {
  const modelId = MODEL_FLASH;

  const config: GenerateContentConfig = {
    systemInstruction: ID_SCANNER_INSTRUCTION,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        documentType: { 
          type: Type.STRING, 
          enum: ["Birth Certificate", "Drivers License", "Social Security Card", "Passport", "Other"],
          description: "The type of the identity document."
        },
        fullName: { type: Type.STRING, description: "Full legal name as it appears." },
        dateOfBirth: { type: Type.STRING, description: "Date of birth in YYYY-MM-DD format." },
        documentNumber: { type: Type.STRING, description: "License number, file number, or SSN." },
        issuingStateOrAuthority: { type: Type.STRING, description: "State or agency that issued the document." },
        expirationDate: { type: Type.STRING, description: "Expiration date if present." },
        address: { type: Type.STRING, description: "Address if present on the document." }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Extract identity data from this document image." }
        ]
      },
      config: config
    });

    return response.text;
  } catch (error) {
    console.error("Identity Parse Error:", error);
    throw error;
  }
};

/**
 * Generates a status correction affidavit.
 */
export const generateAffidavit = async (userData: GenerateAffidavitData) => {
  const modelId = MODEL_FLASH;
  
  const prompt = `
    Generate a formal "Declaration of Status and Affidavit of Fact" formatted as a professional legal document.
    
    Affiant Details:
    Full Legal Name (ALL CAPS): ${userData.legalName}
    Living Name: ${userData.livingName}
    Date of Birth: ${userData.dob}
    Jurisdiction: ${userData.jurisdiction || '[State]'}
    
    Structure:
    1. Title: "DECLARATION OF STATUS AND AFFIDAVIT OF FACT" centered and bold.
    2. Venue: "State of ${userData.jurisdiction || '[State]'} Scilicet"
    3. Body: Numbered paragraphs.
       - Anchor each paragraph with a definition or maxim (e.g. "Whereas, Black's Law defines 'Person' as...").
       - Assert lawful continuity (e.g. "This affidavit preserves the status quo ante...").
       - Rebut corporate personhood and revoke power of attorney.
    4. Jurat: Standard Notary Public block at the bottom.
    
    Use a highly formal, authoritative tone. Ensure visually clean formatting with spacing.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: REMEDY_SYSTEM_INSTRUCTION,
        temperature: 0.3 // Low temperature for consistent, formal output
      }
    });

    return response.text;
  } catch (error) {
    console.error("RemedySynthesizer Error:", error);
    throw error;
  }
};

/**
 * Generates an Accepted for Value (A4V) Tender Letter.
 */
export const generateA4VLetter = async (data: GenerateA4VData) => {
  const modelId = MODEL_FLASH;

  const prompt = `
    Generate a Formal Endorsement/Tender Letter for "Acceptance for Value".
    
    Creditor: ${data.creditorName}
    Account Number: ${data.accountNumber}
    Amount: ${data.amount}
    Tax ID (Exemption): ${data.taxId}
    
    The letter should be formatted as a professional correspondence.
    1. Header with Date and Certified Mail # placeholder.
    2. Recipient Block (CFO of Creditor).
    3. Body: State that the attached instrument is accepted for value and returned for discharge. Reference HJR 192.
    4. "Notice of Fault" clause if not adjusted within 14 days.
    5. Signature block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: REMEDY_SYSTEM_INSTRUCTION,
        temperature: 0.3
      }
    });

    return response.text;
  } catch (error) {
    console.error("A4V Generator Error:", error);
    throw error;
  }
};

/**
 * Generates an FCRA Section 609 Dispute Letter.
 */
export const generateFCRADispute = async (data: GenerateFCRADisputeData) => {
  const prompt = `
    Draft a formal FCRA Section 609 Dispute Letter for the Secured Party Creditor to be sent to a Credit Reporting Agency.
    
    Consumer Name: ${data.name}
    Address: ${data.address}
    Disputed Item: ${data.disputeItem}
    
    The letter must:
    1. Assert the right to know the method of verification (FCRA 609/611).
    2. Demand strict compliance and a verified copy of the original instrument bearing signature.
    3. State that verification via electronic matching (e-Oscar) is insufficient.
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt);
  } catch (error) {
    console.error("FCRA Generator Error:", error);
    throw error;
  }
};

/**
 * Generates a Cease & Desist Letter based on FDCPA violations.
 */
export const generateCeaseDesist = async (data: GenerateCeaseDesistData, violations: FDCPAViolation[]) => {
  const violationText = violations.map((v, i) => `${i+1}. ${v.violationType}: ${v.details}`).join('\n');

  const prompt = `
    Draft a formal Cease and Desist letter to a Debt Collector based on FDCPA violations.
    
    Collector: ${data.collector}
    User: ${data.userName}
    
    Logged Violations:
    ${violationText}
    
    The letter must:
    1. Reference FDCPA sections 805(c) (Cease Communication) and 807 (False/Misleading Representations).
    2. Demand immediate cessation of all contact.
    3. Reserve all rights to sue for statutory damages ($1,000 per action).
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt);
  } catch (error) {
    console.error("C&D Generator Error:", error);
    throw error;
  }
};

/**
 * Drafts a UCC-1 Financing Statement content.
 */
export const draftUCC1Statement = async (data: DraftUCC1Data) => {
  const modelId = MODEL_PRO;

  const prompt = `
    Your task is to generate an educational example of the text content for a UCC-1 Financing Statement.
    The output must satisfy the core requirements of UCC § 9-502, which are:
    1. The name of the debtor.
    2. The name of the secured party.
    3. An indication of the collateral.

    Using the data below, create a clean, text-based representation of a financing statement's essential fields.

    ---
    DATA:
    - Secured Party Name: ${data.securedParty}
    - Secured Party Address: ${data.securedPartyAddress}
    - Debtor's Exact Full Legal Name: ${data.debtorName}
    - Debtor's Mailing Address: ${data.debtorAddress}
    - Collateral Indication: ${data.collateralDescription || "All assets, property, and interests of the Debtor, whether now owned or hereafter acquired."}
    ---

    TASK:
    1.  Format the output clearly with headers for "DEBTOR'S EXACT FULL LEGAL NAME", "SECURED PARTY'S NAME", and "COLLATERAL".
    2.  For the "COLLATERAL" section, use the provided "Collateral Indication". If it is generic, expand upon it to demonstrate a comprehensive description, including terms like "all fixtures, accounts, inventory, equipment, and as-extracted collateral" to illustrate a broad filing under UCC Article 9.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: UCC_SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingBudget: 32768 // Max budget for precision in legal definitions
        }
      }
    });

    return response.text;
  } catch (error) {
    console.error("UCC Drafter Error:", error);
    throw error;
  }
};

/**
 * Generates an Endorsement Allonge (Attachment).
 * Now supports Notary Blocks and Digital Signatures.
 */
export const generateAllonge = async (data: GenerateAllongeData) => {
  const prompt = `
    Draft a formal "Allonge" (Attachment to Instrument).
    
    Instrument Reference: ${data.accountNumber}
    Creditor: ${data.creditorName}
    Amount: ${data.amount}
    Endorsement Type: ${data.type} (e.g., Accepted for Value, Without Recourse)
    Signer: ${data.signerName}
    Include Notary Block: ${data.includeNotary}
    Digital Signature Hash: ${data.digitalSignature || "N/A"}
    
    Format:
    Create a clean, rectangular "slip" layout text.
    Include "ALLONGE TO PROMISSORY NOTE / INSTRUMENT" at the top.
    "Pay to the Order of: United States Treasury" (if A4V).
    "Without Recourse"
    Signature Lines.
    Reference to UCC 3-204 (Endorsement).
    
    If 'Include Notary Block' is true, append a state-generic Jurat for Notary Public acknowledgement at the bottom.
    If 'Digital Signature Hash' is present, include a section labeled "ELECTRONIC SIGNATURE VERIFICATION" with the hash code.
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt);
  } catch (error) {
    console.error("Allonge Generator Error:", error);
    throw error;
  }
};

/**
 * Generates a custom document from a user template.
 */
export const generateCustomDocument = async (systemPrompt: string, userPrompt: string) => {
  const modelId = MODEL_FLASH;
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4
      }
    });
    return response.text;
  } catch (error) {
    console.error("Custom Doc Error:", error);
    throw error;
  }
};

/**
 * Generates a tactical call script.
 */
export const generateCallScript = async (scenario: string): Promise<CallScript> => {
  const modelId = MODEL_FLASH;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate a sovereign phone script for this scenario: ${scenario}`,
      config: {
        systemInstruction: SCRIPT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    return cleanAndParseJSON<CallScript>(response.text);
  } catch (error) {
    console.error("Script Gen Error:", error);
    throw error;
  }
};

/**
 * Generates a Private Trust Indenture.
 */
export const generateTrustIndenture = async (data: GenerateTrustIndentureData) => {
  const modelId = MODEL_PRO;
  
  const prompt = `
    Draft a comprehensive Declaration of Trust for a Private Express Trust, operating under Common Law.
    
    DATA:
    - Trust Name: ${data.trustName}
    - Grantor/Settlor: ${data.grantor}
    - Trustee(s): ${data.trustee}
    - Beneficiary/Beneficiaries: ${data.beneficiary}
    - Situs (Jurisdiction): ${data.situs}
    - Date of Creation: ${data.dateCreated}
    
    TASK:
    Generate the full text of the trust indenture. The document must be well-structured with numbered articles and must include the following essential elements:

    1.  **Article I: Declaration of Trust:** State the Grantor's intent to create an irrevocable express trust and identify the initial trust property (res), referencing a "Schedule A".
    2.  **Article II: Trust Name and Nature:** Specify the name of the trust and declare that it is a private entity, not statutory, and operates under the common law of the specified Situs.
    3.  **Article III: Trustee Appointment and Powers:**
        -   Formally appoint the Trustee.
        -   Grant the Trustee full discretionary power to manage the trust assets in the best interest of the Beneficiary.
        -   List key powers (e.g., to buy, sell, lease, invest).
    4.  **Article IV: Trustee Duties:** Outline the fundamental duties of the Trustee, including the Duty of Loyalty (to act solely for the Beneficiary's benefit) and the Duty of Care (to act as a prudent person would).
    5.  **Article V: Beneficiaries:** Clearly identify the Beneficiary/Beneficiaries.
    6.  **Article VI: Distributions:** Include a clause describing how and when the Trustee may make distributions of income or principal to the Beneficiary. (e.g., "The Trustee shall distribute such amounts of income and principal as the Trustee, in their sole discretion, deems necessary for the health, education, maintenance, and support of the Beneficiary.")
    7.  **Article VII: Spendthrift Provision:** Include a strong spendthrift clause to protect the trust assets from the creditors of the Beneficiary.
    8.  **Article VIII: Governing Law:** State that the laws of the specified Situs (e.g., "${data.situs}") will govern the trust.
    9.  **Article IX: Amendment and Termination:** Declare the trust to be irrevocable and specify the conditions under which it may terminate (e.g., upon the death of the final beneficiary and distribution of all assets).
    10. **Article X: Severability:** Add a standard severability clause, stating that if any provision is deemed unenforceable, the remaining provisions will stay in effect.
    11. **Execution and Notarization:** End with signature blocks for the Grantor and the Trustee(s) and a standard notary jurat block.
    12. **Schedule A:** Append a placeholder for "Schedule A - Trust Property".
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: REMEDY_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Trust Gen Error:", error);
    throw error;
  }
};

/**
 * Generates an Assignment of Title (Funding Document).
 * Optionally attaches a Copyright Notice as an exhibit.
 */
export const generateAssetAssignment = async (data: GenerateAssetAssignmentData) => {
  let exhibitLogic = "";
  if (data.includeCopyright) {
    exhibitLogic = `
      CRITICAL INSTRUCTION: 
      The user has established a Common Law Copyright over the Trade Name.
      You MUST append a section titled "EXHIBIT A: COMMON LAW COPYRIGHT NOTICE" at the end of the document.
      The body of the Assignment must reference "See Attached Exhibit A" when describing the Name property.
      
      EXHIBIT A CONTENT:
      Draft the full text of the Common Law Copyright Notice as Exhibit A.
      Include the following Fee Schedule for unauthorized use and trespass:
      ${data.feeSchedule || "Standard Fee Schedule: $500,000.00 per unauthorized use."}
    `;
  }

  const prompt = `
    Draft a formal "Bill of Sale and Assignment of Title" to transfer property into a Private Trust.
    
    Grantor (Transferor): ${data.grantor}
    Trust (Transferee): ${data.trustName}
    Trustee Accepting: ${data.trustee}
    
    Asset Description:
    ${data.assetDescription}
    (Specifically mention the Birth Certificate Bond No. ${data.bondNumber} if provided).
    
    ${exhibitLogic}

    The document must:
    1. Irrevocably transfer legal and equitable title.
    2. Value consideration at "$1.00 and other good and valuable consideration."
    3. Include acceptance signature lines for the Trustee.
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt, 0.3);
  } catch (error) {
    console.error("Asset Assignment Error:", error);
    throw error;
  }
};

/**
 * Generates a Common Law Copyright Notice for the Name.
 */
export const generateCopyrightNotice = async (data: GenerateCopyrightNoticeData) => {
  const prompt = `
    Draft a "Common Law Copyright Notice and Hold Harmless Agreement".
    
    Copyright Claimant (Living Soul): ${data.owner}
    Trade Name (Debtor/Property): ${data.tradename}
    Registration Date: ${data.registrationDate}
    Fee Schedule: ${data.feeSchedule}
    
    The document must:
    1. Establish the common law claim over the ALL CAPS NAME.
    2. Publicly notice all entities that unauthorized use incurs the fee.
    3. Declare the name as intellectual property.
    4. Include a Self-Executing Contract clause.
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt, 0.3);
  } catch (error) {
    console.error("Copyright Gen Error:", error);
    throw error;
  }
};

/**
 * Generates a Restrictive Endorsement for Checks.
 */
export const generateRestrictiveEndorsement = async (accordData: GenerateRestrictiveEndorsementData) => {
  const prompt = `
    Generate the text for a Restrictive Endorsement to be printed on the back of a check or money order.
    
    Instrument Number: ${accordData.instrumentNumber}
    Claim/Account Number: ${accordData.accountNumber}
    
    Text must include:
    "TENDERED AS FULL SATISFACTION OF ALL CLAIMS"
    "By checking this instrument, payee agrees that the debt is discharged in full."
    "UCC 3-311 Accord and Satisfaction"
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt, 0.3);
  } catch (error) {
    console.error("Endorsement Gen Error:", error);
    throw error;
  }
};

/**
 * Generates an Accord and Satisfaction Cover Letter.
 */
export const generateAccordLetter = async (accordData: GenerateAccordLetterData) => {
  const prompt = `
    Draft a cover letter establishing an Accord and Satisfaction under UCC 3-311.
    
    Creditor: ${accordData.creditorName}
    Account: ${accordData.accountNumber}
    Instrument Enclosed: ${accordData.instrumentNumber} for amount $${accordData.amount}
    
    The letter must:
    1. Explicitly state there is a bona fide dispute regarding the debt amount.
    2. State that the enclosed instrument is tendered in full satisfaction of the claim.
    3. Notify them that processing the instrument constitutes acceptance of these terms.
    4. Direct them to return the instrument if they refuse the offer.
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt, 0.3);
  } catch (error) {
    console.error("Accord Letter Error:", error);
    throw error;
  }
};

/**
 * Generates an International Promissory Note (Sovereign Banking).
 */
export const generateSovereignNote = async (data: GenerateSovereignNoteData) => {
  const modelId = MODEL_PRO;

  const prompt = `
    Draft a high-security "International Promissory Note" based on the UNCITRAL Convention on International Bills of Exchange and International Promissory Notes.
    
    Issuer (Maker): ${data.trustName} (via Trustee ${data.trustee})
    Payee: ${data.payee}
    Amount: ${data.amount} ${data.currency}
    Maturity Date: ${data.maturityDate}
    Jurisdiction: ${data.jurisdiction}
    
    The Note Must Include:
    1. The heading "INTERNATIONAL PROMISSORY NOTE".
    2. Unconditional promise to pay.
    3. Reference to UNCITRAL Convention.
    4. "Payable to the Order of..."
    5. Signature block for the Trustee.
    6. Disclaimer: "This Note is legal tender for all debts, public and private, within the jurisdiction of the Trust."
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: REMEDY_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Note Gen Error:", error);
    throw error;
  }
};

/**
 * Generates Admin Remedy Notices (Feature #3).
 * Step 1: Inquiry, Step 2: Fault, Step 3: Default.
 */
export const generateAdminNotice = async (step: 'Step 1: Inquiry' | 'Step 2: Fault' | 'Step 3: Default', data: GenerateAdminNoticeData) => {
  let stepPrompt = "";
  if (step === 'Step 1: Inquiry') {
    stepPrompt = `Draft a "Notice of Conditional Acceptance and Request for Proof of Claim".
    Assert that the user conditionally accepts the claim upon proof of: 1) A valid contract, 2) A loss by the plaintiff, 3) The plaintiff's authority.
    State that silence will be deemed acquiescence.`;
  } else if (step === 'Step 2: Fault') {
    stepPrompt = `Draft a "Notice of Fault and Opportunity to Cure".
    Reference the previous notice sent on ${data.previousDate}.
    State that the respondent has failed to provide proof of claim within the allotted time.
    Give them a final 3 days to cure this fault before default.`;
  } else {
    stepPrompt = `Draft a "Notice of Default and Certificate of Non-Response".
    Declare that the respondent is in default.
    State that via their silence (Tacit Procuration), they have agreed that the debt is null and void.
    This document serves as the final judgment in commerce (Res Judicata).`;
  }

  const prompt = `
    Draft a formal Administrative Remedy Notice.
    Step: ${step}
    Respondent: ${data.respondent}
    Subject Matter: ${data.subject}
    My Name: ${data.sender}
    
    ${stepPrompt}
    
    Include a "Notary Presentment" block at the end for a third-party witness.
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt);
  } catch (error) {
    console.error("Admin Notice Error:", error);
    throw error;
  }
};

/**
 * Generates a Commercial Invoice (Feature #1).
 */
export const generateInvoice = async (data: GenerateInvoiceData) => {
  const prompt = `
    Draft a "Commercial Invoice" / "True Bill".
    
    Billed To (Violator): ${data.violator}
    From (Creditor): ${data.sender}
    Invoice Number: ${data.invoiceNumber}
    Date: ${data.date}
    
    Line Item: Violation of Rights / Trespass (${data.violationType})
    Amount: ${data.amount}
    
    Terms: Due Upon Receipt.
    
    Include a "Notice" at the bottom: "Failure to pay this invoice within 10 days will result in a commercial lien being placed against the personal property of the named respondent."
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt);
  } catch (error) {
    console.error("Invoice Gen Error:", error);
    throw error;
  }
};

/**
 * Generates a Rescission of Signature Notice (Feature #2).
 */
export const generateRescissionNotice = async (data: GenerateRescissionNoticeData) => {
  const prompt = `
    Draft a formal "Notice of Rescission of Signature and Revocation of Power of Attorney".
    
    Agency: ${data.agency}
    Reason for Rescission: ${data.reason}
    Account/File Reference: ${data.refNumber}
    
    Arguments:
    1. The original signature was obtained without full disclosure (Constructive Fraud).
    2. The signer was under duress or threat of penalty.
    3. Declare the contract void ab initio (Nunc Pro Tunc).
    4. Revoke any implied Power of Attorney granted to the agency.
  `;

  try {
    return await generateDocument(MODEL_FLASH, REMEDY_SYSTEM_INSTRUCTION, prompt);
  } catch (error) {
    console.error("Rescission Gen Error:", error);
    throw error;
  }
};
