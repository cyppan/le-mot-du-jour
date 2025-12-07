import { GRAMMALECTE_DICTIONARY } from '../data/grammalecteDictionary';

/**
 * Curated list of 100 French words for Tusmo daily game
 * Words are common French nouns, 6-10 letters, no accents
 * Selected one per day in order (use getDailyWord function)
 * List is pre-shuffled for variety in word lengths
 *
 * Sources: motsavec.fr, eduscol.education.fr French frequency lists
 */

export const WORD_LIST: string[] = [
  'VITESSE',
  'PRODUCTION',
  'ARGENT',
  'FAMILLE',
  'QUARTIER',
  'BRONZE',
  'SITUATION',
  'THEATRE',
  'NIVEAU',
  'COMMERCE',
  'PEINTRE',
  'POPULATION',
  'SAISON',
  'ORIGINE',
  'BATAILLE',
  'MARQUE',
  'TECHNIQUE',
  'JOURNAL',
  'PROJET',
  'DIRECTION',
  'DOUBLE',
  'CHANSON',
  'ALTITUDE',
  'SUCCES',
  'STRUCTURE',
  'RETOUR',
  'VILLAGE',
  'MEILLEUR',
  'CINEMA',
  'PERSONNEL',
  'HAUTEUR',
  'MAISON',
  'CREATION',
  'OISEAU',
  'SERVICE',
  'NAISSANCE',
  'COURSE',
  'PRODUIT',
  'TERMINAL',
  'MEMBRE',
  'POLITIQUE',
  'SURFACE',
  'JARDIN',
  'VICTOIRE',
  'EXEMPLE',
  'RECORD',
  'INDUSTRIE',
  'DOMAINE',
  'GROUPE',
  'POSITION',
  'MANIERE',
  'PARFUM',
  'AUTOMOBILE',
  'TRAVAIL',
  'EPOQUE',
  'CARRIERE',
  'RIVIERE',
  'ACTION',
  'PRESIDENT',
  'SYSTEME',
  'COMBAT',
  'ENSEMBLE',
  'HONNEUR',
  'MILIEU',
  'EXPERIENCE',
  'CHATEAU',
  'SIMPLE',
  'TOUJOURS',
  'STATION',
  'AUTEUR',
  'SIGNATURE',
  'VERSION',
  'NATURE',
  'HISTOIRE',
  'PASSAGE',
  'LANGUE',
  'TELEVISION',
  'ARTICLE',
  'MESURE',
  'PRINCIPE',
  'DEMANDE',
  'PUBLIC',
  'FONCTION',
  'MUSIQUE',
  'MODELE',
  'AVANTAGE',
  'SECONDE',
  'REGION',
  'PROBLEME',
  'POUVOIR',
  'CLASSE',
  'DIVISION',
  'TERRAIN',
  'RAISON',
  'QUESTION',
  'CULTURE',
  'SIGNAL',
  'MONTAGNE',
  'MOMENT',
  'RESEAU',
];

// Reference date for the daily word (start of the game)
const REFERENCE_DATE = new Date('2024-01-01');

/**
 * Get the word for a specific day
 * Words cycle through the list in order, no repetition until all 100 are used
 */
export function getDailyWord(date: Date = new Date()): string {
  // Calculate days since reference date
  const diffTime = date.getTime() - REFERENCE_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Get word index (cycles through the list)
  const wordIndex = Math.abs(diffDays) % WORD_LIST.length;

  return WORD_LIST[wordIndex];
}

/**
 * Get the word index for today (useful for showing "Word #X")
 */
export function getDailyWordNumber(date: Date = new Date()): number {
  const diffTime = date.getTime() - REFERENCE_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays) + 1;
}

// Cache the dictionary array for random word selection
let grammalecteArray: string[] | null = null;

/**
 * Get a random word from the Grammalecte dictionary for free mode
 * Uses same dictionary as SUTOM (https://sutom.nocle.fr)
 */
export function getRandomWord(): string {
  if (!grammalecteArray) {
    grammalecteArray = Array.from(GRAMMALECTE_DICTIONARY);
  }
  return grammalecteArray[Math.floor(Math.random() * grammalecteArray.length)];
}
