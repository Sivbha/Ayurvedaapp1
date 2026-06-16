import { DoshaScores, ConstitutionType, AgniType, AmaLevel } from './assessment';

export interface PractitionerReport {
  metadata: { assessmentId: string; generatedAt: string; version: string };
  clientDetails: ClientDetails;
  consentStatus: ConsentStatus;
  safetyFlags: SafetyFlags;
  prakritiConclusion: PrakritiConclusion;
  vikritiConclusion: VikritiConclusion;
  agniAssessment: AgniAssessment;
  amaIndicators: AmaAssessment;
  foodPatternAnalysis: FoodPatternAnalysis;
  symptomPatternAnalysis: SymptomPatternAnalysis;
  doshaScoringTable: DoshaScoringTable;
  reasoning: ReasoningTrace;
  contradictions: Contradiction[];
  dietDirection: DietDirection;
  weeklyMealPlan: WeeklyMealPlan;
  yogaExercise: YogaRecommendations;
  herbsFoodSupport: HerbRecommendations;
  medicalCautions: MedicalCaution[];
  followUpQuestions: FollowUpQuestion[];
}

export interface ClientReport {
  metadata: { assessmentId: string; generatedAt: string };
  likelyConstitution: ConstitutionSummary;
  currentImbalance: ImbalanceSummary;
  foodPatternInsight: string;
  foodsToFavour: FoodGroup[];
  foodsToReduce: FoodGroup[];
  sampleWeeklyMealPlan: WeeklyMealPlan;
  gentleMovement: MovementPlan;
  breathwork: BreathworkPlan;
  gutSupport: GutSupportPlan;
  whenToSeekHelp: RedFlagList;
  disclaimer: string;
}

export interface ClientDetails {
  fullName: string; age: number; sex: string; country: string;
  occupation?: string; dietaryPreferences: string[];
}
export interface ConsentStatus {
  given: boolean; timestamp: string; disclaimerAccepted: boolean;
}
export interface SafetyFlags {
  isPregnant: boolean; isBreastfeeding: boolean;
  medications: string[]; healthConditions: string[]; allergies: string[];
  redFlags: string[]; redFlagDetected: boolean; herbContraindicated: boolean;
}
export interface PrakritiConclusion {
  constitution: ConstitutionType; confidence: number; scores: DoshaScores; description: string;
}
export interface VikritiConclusion {
  imbalance: string; severity: 'low' | 'moderate' | 'high'; scores: DoshaScores;
  keySymptoms: string[]; description: string;
}
export interface AgniAssessment {
  type: AgniType; score: number; description: string; indicators: string[];
}
export interface AmaAssessment {
  level: AmaLevel; score: number; indicators: string[]; description: string;
}
export interface FoodPatternAnalysis {
  patternType: string; doshaImpact: DoshaScores; keyFindings: string[];
  mealTimingAnalysis: string; foodQualityAnalysis: string;
}
export interface SymptomPatternAnalysis {
  topCategories: { category: string; count: number; severity: string }[];
  doshaCorrelations: DoshaScores; notablePatterns: string[];
}
export interface DoshaScoringTable {
  prakriti: { dosha: string; rawScore: number; percentage: number }[];
  vikriti: { dosha: string; rawScore: number; percentage: number }[];
  combined: { dosha: string; prakritiPct: number; vikritiPct: number; netImbalance: number }[];
}
export interface ReasoningTrace {
  prakritiReasoning: string[]; vikritiReasoning: string[]; agniReasoning: string[];
  amaReasoning: string[]; foodPatternReasoning: string[];
}
export interface Contradiction { area: string; description: string; confidence: number; }
export interface DietDirection {
  primaryDoshaToBalance: string; secondaryDoshaToBalance?: string;
  dietaryPrinciples: string[]; favoredTastes: string[];
  reducedTastes: string[]; favoredQualities: string[]; reducedQualities: string[];
}
export interface WeeklyMealPlan { days: DailyMealPlan[]; notes: string[]; }
export interface DailyMealPlan {
  day: string; breakfast: MealPlanItem; lunch: MealPlanItem;
  dinner: MealPlanItem; snacks: MealPlanItem[];
}
export interface MealPlanItem {
  name: string; description: string; ingredients: string[];
  doshaEffect: string; prepTimeMinutes: number;
}
export interface YogaRecommendations {
  poses: YogaPose[]; sequence: string[]; durationMinutes: number;
  frequencyPerWeek: number; contraindications: string[];
}
export interface YogaPose {
  name: string; sanskritName: string; description: string;
  benefits: string[]; modifications: string[]; doshaEffect: string;
}
export interface HerbRecommendations {
  herbs: HerbRecommendation[]; contraindications: string[];
  interactions: string[]; noHerbMode: boolean;
}
export interface HerbRecommendation {
  name: string; sanskritName: string;
  form: 'powder' | 'tablet' | 'tea' | 'decoction' | 'ghee' | 'oil';
  dosage: string; timing: string; duration: string;
  indications: string[]; precautions: string[]; doshaEffect: string;
}
export interface MedicalCaution {
  type: 'red_flag' | 'medication_interaction' | 'condition_contraindication' | 'pregnancy' | 'general';
  severity: 'high' | 'medium' | 'low';
  description: string; recommendation: string;
}
export interface FollowUpQuestion { question: string; context: string; priority: 'high' | 'medium' | 'low'; }
export interface ConstitutionSummary { type: ConstitutionType; description: string; strengths: string[]; challenges: string[]; }
export interface ImbalanceSummary { pattern: string; description: string; mainSymptoms: string[]; aggravatedDosha: string; }
export interface FoodGroup { name: string; examples: string[]; reason: string; frequency: 'daily' | '3-4x_week' | '1-2x_week' | 'occasionally'; }
export interface MovementPlan { type: string; durationMinutes: number; frequencyPerWeek: number; specificRecommendations: string[]; avoid: string[]; }
export interface BreathworkPlan { techniques: BreathworkTechnique[]; durationMinutes: number; frequencyPerDay: number; }
export interface BreathworkTechnique { name: string; sanskritName: string; instructions: string[]; benefits: string[]; contraindications: string[]; }
export interface GutSupportPlan { recommendations: GutRecommendation[]; foodsToInclude: string[]; foodsToAvoid: string[]; }
export interface GutRecommendation { title: string; description: string; evidence: string; }
export interface RedFlagList { items: RedFlagItem[]; disclaimer: string; }
export interface RedFlagItem { symptom: string; action: string; urgency: 'immediate' | 'within_24h' | 'within_week' | 'next_visit'; }
