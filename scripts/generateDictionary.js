// Script to download ODS8 dictionary and generate TypeScript file
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICTIONARY_URL = 'https://raw.githubusercontent.com/Thecoolsim/French-Scrabble-ODS8/main/French%20ODS%20dictionary.txt';
const OUTPUT_PATH = path.join(__dirname, '../src/data/frenchDictionary.ts');

async function fetchDictionary() {
  return new Promise((resolve, reject) => {
    https.get(DICTIONARY_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

async function main() {
  console.log('Downloading ODS8 dictionary...');
  const rawData = await fetchDictionary();

  // Parse and filter words (6-10 letters only)
  const words = rawData
    .split('\n')
    .map(word => word.trim().toUpperCase())
    .filter(word => word.length >= 6 && word.length <= 10)
    .filter(word => /^[A-Z]+$/.test(word)); // Only letters, no accents

  // Remove duplicates
  const uniqueWords = [...new Set(words)].sort();

  console.log(`Filtered to ${uniqueWords.length} words (6-10 letters)`);

  // Generate TypeScript file
  const tsContent = `// French dictionary for word validation (6-10 letters only)
// Source: ODS8 (Officiel du Scrabble 2021)
// Generated: ${new Date().toISOString()}
// Word count: ${uniqueWords.length}

export const FRENCH_DICTIONARY: Set<string> = new Set([
${uniqueWords.map(w => `  '${w}',`).join('\n')}
]);
`;

  // Ensure directory exists
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, tsContent);
  console.log(`Written to ${OUTPUT_PATH}`);
}

main().catch(console.error);
