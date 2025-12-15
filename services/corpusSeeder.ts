const web_fetch = async ({ prompt: url }: { prompt: string }): Promise<string> => {
  const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.contents;
};
import { addCorpusItems } from './db';
import { CorpusItem } from '../types';

const FRCP_BASE_URL = 'https://www.law.cornell.edu';
const FRCP_INDEX_URL = `${FRCP_BASE_URL}/rules/frcp`;
const CONSTITUTION_URL = 'https://www.archives.gov/founding-docs/constitution-transcript';
const BILL_OF_RIGHTS_URL = 'https://www.archives.gov/founding-docs/bill-of-rights-transcript';
const AMENDMENTS_11_27_URL = 'https://www.archives.gov/founding-docs/amendments-11-27';


// A simple utility to strip HTML tags.
const stripTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
};

const STRATEGIC_NOTES: { [key: string]: string } = {
  "12": "Rule 12 is a primary procedural gateway. Motions under 12(b)(1) for lack of subject-matter jurisdiction and 12(b)(6) for failure to state a claim are fundamental challenges to an opponent's case.",
  "8": "Rule 8 sets the general rules of pleading. A claim for relief must contain a short and plain statement of the grounds for the court's jurisdiction and the claim showing the pleader is entitled to relief.",
  "56": "Governs summary judgment. This is a motion made after discovery, arguing there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law."
};

/**
 * Parses the HTML of an individual FRCP rule page.
 */
const parseRulePage = (html: string): Omit<CorpusItem, 'Source' | 'Jurisdiction' | 'EffectiveDate'> | null => {
  try {
    const titleMatch = html.match(/<h2 class="title node-title">(.*?)<\/h2>/);
    if (!titleMatch) return null;
    
    let titleText = stripTags(titleMatch[1]);
    const ruleNumberMatch = titleText.match(/Rule (\d+(\.\d+)?)/);
    const ruleNumber = ruleNumberMatch ? ruleNumberMatch[1] : 'Unknown';
    
    titleText = titleText.replace(`Rule ${ruleNumber}.`, '').trim();

    const contentMatch = html.match(/<div class="field-item even" property="content:encoded">([\s\S]*?)<\/div>/);
    if (!contentMatch) return null;
    
    let textContent = contentMatch[1];
    textContent = textContent.replace(/<a[^>]*>|<\/a>/g, '');
    textContent = textContent.replace(/<strong[^>]*>|<\/strong>/g, '**');
    textContent = textContent.replace(/<em[^>]*>|<\/em>/g, '*');
    textContent = textContent.replace(/<p[^>]*>/g, '\n\n').replace(/<\/p>/g, '');
    textContent = textContent.replace(/<li[^>]*>/g, '\n- ').replace(/<\/li>/g, '');
    textContent = stripTags(textContent);

    return {
      Citation: `FRCP Rule ${ruleNumber}`,
      RuleNumber_Section: ruleNumber,
      Title: titleText,
      Text: textContent,
      StrategicNotes: STRATEGIC_NOTES[ruleNumber] || undefined
    };
  } catch (e) {
    console.error("Failed to parse rule page:", e);
    return null;
  }
};

/**
 * Fetches, parses, and stores the Federal Rules of Civil Procedure.
 */
export const seedFrcpData = async (
  onProgress: (message: string) => void
): Promise<{ success: boolean; count: number; error?: string }> => {
  onProgress('Starting FRCP seeding process...');
  
  try {
    onProgress(`Fetching rule index from ${FRCP_INDEX_URL}...`);
    const indexResponse = await web_fetch({ prompt: FRCP_INDEX_URL });
    
    onProgress('Parsing rule index...');
    const ruleUrlMatches = indexResponse.match(/\/rules\/frcp\/rule_\d+(\.\d+)?/g);
    if (!ruleUrlMatches) {
        throw new Error('Could not parse rule URLs from the index page.');
    }
    const ruleUrls = [...new Set(ruleUrlMatches)];

    onProgress(`Found ${ruleUrls.length} unique rule links. Fetching content...`);

    const corpusItems: CorpusItem[] = [];
    
    for (const ruleUrl of ruleUrls) {
      const fullUrl = `${FRCP_BASE_URL}${ruleUrl}`;
      onProgress(`Fetching ${ruleUrl}...`);
      
      try {
        const ruleResponse = await web_fetch({ prompt: fullUrl });
        const parsedItem = parseRulePage(ruleResponse);

        if (parsedItem) {
          corpusItems.push({
            ...parsedItem,
            Source: 'Rule',
            Jurisdiction: 'Federal',
          });
        } else {
          onProgress(`- WARN: Failed to parse ${ruleUrl}. Skipping.`);
        }
      } catch (e: any) {
        onProgress(`- ERROR fetching ${ruleUrl}: ${e.message}. Skipping.`);
      }
    }

    if (corpusItems.length > 0) {
      onProgress(`Storing ${corpusItems.length} parsed rules in the database...`);
      await addCorpusItems(corpusItems);
    }

    onProgress('FRCP seeding process completed successfully.');
    return { success: true, count: corpusItems.length };

  } catch (error: any) {
    console.error('Error during FRCP seeding:', error);
    onProgress(`FATAL: ${error.message}`);
    return { success: false, count: 0, error: error.message };
  }
};


/**
 * =================================================================
 * U.S. CONSTITUTION SEEDER
 * =================================================================
 */

const parseConstitutionPreambleAndArticles = (html: string): CorpusItem[] => {
    console.log("Parsing main Constitution page...");
    const items: CorpusItem[] = [];
    // This is a simplified parser based on the structure of the archives.gov page
    const contentMatch = html.match(/<div id="block-hamilton-content" class="block block-hamilton">([\s\S]*?)<\/div>/);
    if (!contentMatch) return [];

    let content = contentMatch[1];
    
    // Preamble
    const preambleMatch = content.match(/<h2[^>]*>Preamble<\/h2>([\s\S]*?)<h2/);
    if (preambleMatch) {
        items.push({
            Source: 'Constitution',
            Jurisdiction: 'Federal',
            Citation: 'U.S. Const. preamble',
            Title: 'Preamble',
            Text: stripTags(preambleMatch[1]),
            RuleNumber_Section: 'Preamble'
        });
    }

    // Articles
    const articleMatches = [...content.matchAll(/<h3[^>]*>(Article\.\s[IVXLCDM]+)<\/h3>([\s\S]*?)(?=<h3|$)/g)];
    for (const match of articleMatches) {
        const articleTitle = stripTags(match[1]);
        const articleContent = match[2];
        
        items.push({
            Source: 'Constitution',
            Jurisdiction: 'Federal',
            Citation: `U.S. Const. ${articleTitle.replace(/\s/g, '').replace(/\./g, '')}`,
            Title: articleTitle,
            Text: stripTags(articleContent),
            RuleNumber_Section: articleTitle.replace('Article. ', '')
        });
    }
    return items;
};

const parseAmendments = (html: string, startNum: number): CorpusItem[] => {
    console.log(`Parsing amendments page starting from ${startNum}...`);
    const items: CorpusItem[] = [];
    const contentMatch = html.match(/<div id="block-hamilton-content" class="block block-hamilton">([\s\S]*?)<\/div>/);
    if (!contentMatch) return [];

    let content = contentMatch[1];
    
    const amendmentMatches = [...content.matchAll(/<h3[^>]*>(Amendment\s\d+)<\/h3>([\s\S]*?)(?=<h3|$)/g)];
     for (const match of amendmentMatches) {
        const amendmentTitle = stripTags(match[1]);
        const amendmentNumMatch = amendmentTitle.match(/\d+/);
        if (!amendmentNumMatch) continue;
        const amendmentNum = amendmentNumMatch[0];

        items.push({
            Source: 'Constitution',
            Jurisdiction: 'Federal',
            Citation: `U.S. Const. amend. ${amendmentNum}`,
            Title: amendmentTitle,
            Text: stripTags(match[2]),
            RuleNumber_Section: amendmentNum
        });
    }
    return items;
};


export const seedConstitutionData = async (
  onProgress: (message: string) => void
): Promise<{ success: boolean; count: number; error?: string }> => {
  onProgress('Starting U.S. Constitution seeding process...');
  let allItems: CorpusItem[] = [];

  try {
    onProgress(`Fetching from ${CONSTITUTION_URL}...`);
    const constitutionHtml = await web_fetch({ prompt: CONSTITUTION_URL });
    allItems = allItems.concat(parseConstitutionPreambleAndArticles(constitutionHtml));

    onProgress(`Fetching from ${BILL_OF_RIGHTS_URL}...`);
    const billOfRightsHtml = await web_fetch({ prompt: BILL_OF_RIGHTS_URL });
    allItems = allItems.concat(parseAmendments(billOfRightsHtml, 1));

    onProgress(`Fetching from ${AMENDMENTS_11_27_URL}...`);
    const laterAmendmentsHtml = await web_fetch({ prompt: AMENDMENTS_11_27_URL });
    allItems = allItems.concat(parseAmendments(laterAmendmentsHtml, 11));

    if (allItems.length > 0) {
      onProgress(`Storing ${allItems.length} constitutional items in the database...`);
      await addCorpusItems(allItems);
    }
    
    onProgress('Constitution seeding process completed successfully.');
    return { success: true, count: allItems.length };

  } catch (error: any) {
    console.error('Error during Constitution seeding:', error);
    onProgress(`FATAL: ${error.message}`);
    return { success: false, count: 0, error: error.message };
  }
};