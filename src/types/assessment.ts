export type DoshaType = 'vata' | 'pitta' | 'kapha';
export type DualDoshaType = 'vata-pitta' | 'pitta-vata' | 'vata-kapha' | 'kapha-vata' | 'pitta-kapha' | 'kapha-pitta';
export type ConstitutionType = DoshaType | DualDoshaType | 'tridoshic';
export type Sex = 'male' | 'female' | 'other' | 'prefer_not_say';
export type DietaryPreference = 'vegan' | 'vegetarian' | 'pescatarian' | 'dairy_free' | 'gluten_free' | 'nut_free' | 'soy_free' | 'egg_free' | 'halal' | 'kosher';
export type AssessmentStatus = 'draft' | 'submitted' | 'in_review' | 'released' | 'archived';
export type AgniType = 'sama' | 'vishama' | 'tikshna' | 'manda';
export type AmaLevel = 'low' | 'moderate' | 'high';
export type PrakritiCategory = 'physical' | 'metabolic' | 'behavioral' | 'psychological';
export type VikritiCategory = 'digestive' | 'energy_mood' | 'physical' | 'reproductive';
export type FoodCategory = 'grains' | 'vegetables' | 'fruits' | 'proteins' | 'dairy' | 'fats' | 'sweets' | 'spices' | 'beverages' | 'fermented' | 'processed' | 'raw' | 'leftovers';
export type SymptomCategory = 'digestion' | 'energy' | 'sleep' | 'mood' | 'skin' | 'hair' | 'joints_muscles' | 'urination' | 'bowel_movements' | 'weight_changes' | 'food_cravings' | 'stress' | 'temperature_sensitivity' | 'immunity' | 'pain' | 'other';

export interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
}

export interface PrakritiAnswer {
  category: PrakritiCategory;
  questionKey: string;
  answerValue: string;
  answerLabel: string;
  doshaScores: DoshaScores;
}

export interface VikritiAnswer {
  category: VikritiCategory;
  questionKey: string;
  severity: 0 | 1 | 2 | 3;
  durationWeeks?: number;
  doshaImpact: DoshaScores;
}

export interface MealEntry {
  time: string;
  food: string;
  categories: FoodCategory[];
}

export interface FoodDiaryEntry {
  dayNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  date: string;
  wakeTime?: string;
  breakfast?: MealEntry;
  lunch?: MealEntry;
  dinner?: MealEntry;
  snacks?: MealEntry;
  caffeine: boolean;
  sugarSweets: boolean;
  friedFoods: boolean;
  spicyFoods: boolean;
  fermentedFoods: boolean;
  dairy: boolean;
  glutenWheat: boolean;
  beansLegumes: boolean;
  rawSalads: boolean;
  leftovers: boolean;
  eatingOut: boolean;
  mealSize: 'small' | 'medium' | 'large';
  eatingSpeed: 'slow' | 'moderate' | 'fast';
  hungerBeforeMeals: 'low' | 'normal' | 'high';
  symptomsAfterMeals: string[];
}

export interface SymptomEntry {
  category: SymptomCategory;
  symptoms: string[];
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface Assessment {
  id: string;
  clientId: string;
  practitionerId?: string;
  status: AssessmentStatus;
  currentStep: number;
  fullName: string;
  email: string;
  phone?: string;
  age: number;
  sex: Sex;
  country: string;
  occupation?: string;
  dietaryPreferences: DietaryPreference[];
  consentGiven: boolean;
  disclaimerAccepted: boolean;
  consentTimestamp?: string;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  medications: string[];
  healthConditions: string[];
  allergies: string[];
  redFlags: string[];
  redFlagDetected: boolean;
  startedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrakritiResult {
  scores: DoshaScores;
  normalized: DoshaScores;
  dominant: ConstitutionType;
  confidence: number;
  explanation: string;
  rawAnswers: PrakritiAnswer[];
}

export interface VikritiResult {
  scores: DoshaScores;
  normalized: DoshaScores;
  dominant: DoshaType;
  severity: 'low' | 'moderate' | 'high';
  keyIndicators: string[];
  explanation: string;
  rawAnswers: VikritiAnswer[];
}

export interface AgniInputs {
  prakriti: PrakritiResult;
  vikriti: VikritiResult;
  foodDiary: FoodDiaryEntry[];
  symptoms: SymptomEntry[];
}

export interface AgniResult {
  type: AgniType;
  score: number;
  description: string;
  recommendations: string[];
}

export interface AmaResult {
  score: number;
  level: AmaLevel;
  indicators: string[];
  recommendations: string[];
}

export interface FoodPatternResult {
  patternType: 'vata_aggravating' | 'pitta_aggravating' | 'kapha_aggravating' | 'balanced' | 'irregular';
  doshaImpact: DoshaScores;
  keyFindings: string[];
  recommendations: string[];
}
