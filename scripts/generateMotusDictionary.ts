/**
 * Generate a Motus-compatible dictionary from Lexique383
 *
 * Original Motus rules (France 2):
 * - ALLOWED: Infinitifs, Participes passés, Participes présents, Noms, Adjectifs, Adverbes
 * - NOT ALLOWED: Verbes conjugués, Noms propres, Interjections
 *
 * Lexique383 columns used:
 * - ortho (col 0): word as written
 * - cgram (col 3): grammatical category (NOM, VER, ADJ, ADV, etc.)
 * - infover (col 10): verb inflection info (inf;; = infinitive, par:pas = past participle, par:pre = present participle)
 * - nblettres (col 14): number of letters
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEXIQUE_PATH = path.join(__dirname, 'Lexique383.tsv');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'motusDictionary.ts');

// Categories allowed in Motus
const ALLOWED_CATEGORIES = new Set([
  'NOM',      // Nouns
  'ADJ',      // Adjectives
  'ADV',      // Adverbs
  'ADJ:num',  // Numerical adjectives (UN, DEUX, etc.)
  'VER',      // Verbs (will filter for inf/participles only)
  'AUX',      // Auxiliary verbs (être, avoir)
]);

// Word length range for the game
const MIN_LENGTH = 6;
const MAX_LENGTH = 10;

function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function isAllowedVerb(infover: string): boolean {
  if (!infover) return false;

  // Check for infinitive or participles
  return (
    infover.includes('inf;') ||      // infinitive
    infover.includes('par:pas') ||   // past participle (mangé, mangée, mangés, mangées)
    infover.includes('par:pre')      // present participle (mangeant)
  );
}

function processLexique(): Set<string> {
  const content = fs.readFileSync(LEXIQUE_PATH, 'utf-8');
  const lines = content.split('\n');
  const words = new Set<string>();

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = line.split('\t');
    const ortho = cols[0];
    const cgram = cols[3];
    const infover = cols[10];

    // Skip if category not allowed
    if (!ALLOWED_CATEGORIES.has(cgram)) continue;

    // For verbs, only allow infinitives and participles
    if (cgram === 'VER' || cgram === 'AUX') {
      if (!isAllowedVerb(infover)) continue;
    }

    // Normalize word (remove accents, uppercase)
    const normalized = removeAccents(ortho);

    // Check length constraints
    if (normalized.length < MIN_LENGTH || normalized.length > MAX_LENGTH) continue;

    // Skip words with hyphens, apostrophes, or spaces
    if (/[-' ]/.test(normalized)) continue;

    // Skip words with non-letter characters
    if (!/^[A-Z]+$/.test(normalized)) continue;

    words.add(normalized);
  }

  return words;
}

function generateOutput(words: Set<string>): void {
  const sortedWords = Array.from(words).sort();

  const output = `// Motus-compatible dictionary (filtered from Lexique383)
// Source: Lexique 3.83 (http://www.lexique.org)
// Generated: ${new Date().toISOString()}
// Word count: ${sortedWords.length}
//
// Filtering rules (original Motus France 2):
// - Nouns, Adjectives, Adverbs: ALL included
// - Verbs: ONLY infinitives + past participles + present participles
// - NO conjugated verb forms
// - Word length: ${MIN_LENGTH}-${MAX_LENGTH} letters
// - Accents removed

export const MOTUS_DICTIONARY: Set<string> = new Set([
${sortedWords.map(w => `  '${w}',`).join('\n')}
]);

export function isValidMotusWord(word: string): boolean {
  return MOTUS_DICTIONARY.has(word.toUpperCase());
}
`;

  fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
}

// Run
console.log('Processing Lexique383...');
const words = processLexique();
console.log(`Found ${words.size} Motus-compatible words`);

generateOutput(words);
console.log(`Dictionary written to ${OUTPUT_PATH}`);

// Stats
const stats = {
  total: words.size,
  by_length: {} as Record<number, number>,
};

for (const word of words) {
  const len = word.length;
  stats.by_length[len] = (stats.by_length[len] || 0) + 1;
}

console.log('\nWords by length:');
for (let len = MIN_LENGTH; len <= MAX_LENGTH; len++) {
  console.log(`  ${len} letters: ${stats.by_length[len] || 0}`);
}
