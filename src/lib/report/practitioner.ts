import { PractitionerReport } from '@/types/report';

export function generatePractitionerReport(assessment: any, scoring: any): PractitionerReport {
  const prakritiDominant = scoring.prakriti_dominant || 'balanced';
  const vikritiDominant = scoring.vikriti_dominant || 'balanced';

  return {
    metadata: {
      assessmentId: assessment.id,
      generatedAt: new Date().toISOString(),
      version: '1.0',
    },
    clientDetails: {
      fullName: assessment.full_name || '',
      age: assessment.age || 0,
      sex: assessment.sex || '',
      country: assessment.country || '',
      occupation: assessment.occupation || '',
      dietaryPreferences: assessment.dietary_preferences || [],
    },
    consentStatus: {
      given: assessment.consent_given || false,
      timestamp: assessment.consent_timestamp || '',
      disclaimerAccepted: assessment.disclaimer_accepted || false,
    },
    safetyFlags: {
      isPregnant: assessment.is_pregnant || false,
      isBreastfeeding: assessment.is_breastfeeding || false,
      medications: assessment.medications || [],
      healthConditions: assessment.health_conditions || [],
      allergies: assessment.allergies || [],
      redFlags: assessment.red_flags || [],
      redFlagDetected: assessment.red_flag_detected || false,
      herbContraindicated: assessment.is_pregnant || assessment.red_flag_detected || (assessment.medications?.length > 0),
    },
    prakritiConclusion: {
      constitution: prakritiDominant,
      confidence: scoring.prakriti_confidence || 0,
      scores: { vata: scoring.prakriti_vata || 0, pitta: scoring.prakriti_pitta || 0, kapha: scoring.prakriti_kapha || 0 },
      description: `Client presents with ${prakritiDominant} constitution based on lifelong tendencies.`,
    },
    vikritiConclusion: {
      imbalance: vikritiDominant,
      severity: scoring.vikriti_raw?.severity || 'low',
      scores: { vata: scoring.vikriti_vata || 0, pitta: scoring.vikriti_pitta || 0, kapha: scoring.vikriti_kapha || 0 },
      keySymptoms: scoring.vikriti_raw?.keyIndicators || [],
      description: `Current imbalance pattern shows ${vikritiDominant} aggravation.`,
    },
    agniAssessment: {
      type: scoring.agni_type || 'sama',
      score: scoring.agni_score || 0,
      description: scoring.agni_notes || 'Agni assessment completed.',
      indicators: [],
    },
    amaIndicators: {
      level: scoring.ama_level || 'low',
      score: scoring.ama_score || 0,
      indicators: scoring.ama_indicators || [],
      description: `Ama level: ${scoring.ama_level || 'low'}`,
    },
    foodPatternAnalysis: {
      patternType: scoring.food_pattern_type || 'balanced',
      doshaImpact: { vata: 33, pitta: 33, kapha: 33 },
      keyFindings: scoring.food_pattern_notes ? scoring.food_pattern_notes.split('; ') : [],
      mealTimingAnalysis: 'Review food diary for meal timing patterns.',
      foodQualityAnalysis: 'Review food diary for food quality patterns.',
    },
    symptomPatternAnalysis: {
      topCategories: [],
      doshaCorrelations: { vata: scoring.vikriti_vata || 0, pitta: scoring.vikriti_pitta || 0, kapha: scoring.vikriti_kapha || 0 },
      notablePatterns: [],
    },
    doshaScoringTable: {
      prakriti: [
        { dosha: 'Vata', rawScore: scoring.prakriti_vata || 0, percentage: scoring.prakriti_vata || 0 },
        { dosha: 'Pitta', rawScore: scoring.prakriti_pitta || 0, percentage: scoring.prakriti_pitta || 0 },
        { dosha: 'Kapha', rawScore: scoring.prakriti_kapha || 0, percentage: scoring.prakriti_kapha || 0 },
      ],
      vikriti: [
        { dosha: 'Vata', rawScore: scoring.vikriti_vata || 0, percentage: scoring.vikriti_vata || 0 },
        { dosha: 'Pitta', rawScore: scoring.vikriti_pitta || 0, percentage: scoring.vikriti_pitta || 0 },
        { dosha: 'Kapha', rawScore: scoring.vikriti_kapha || 0, percentage: scoring.vikriti_kapha || 0 },
      ],
      combined: [
        { dosha: 'Vata', prakritiPct: scoring.prakriti_vata || 0, vikritiPct: scoring.vikriti_vata || 0, netImbalance: (scoring.vikriti_vata || 0) - (scoring.prakriti_vata || 0) },
        { dosha: 'Pitta', prakritiPct: scoring.prakriti_pitta || 0, vikritiPct: scoring.vikriti_pitta || 0, netImbalance: (scoring.vikriti_pitta || 0) - (scoring.prakriti_pitta || 0) },
        { dosha: 'Kapha', prakritiPct: scoring.prakriti_kapha || 0, vikritiPct: scoring.vikriti_kapha || 0, netImbalance: (scoring.vikriti_kapha || 0) - (scoring.prakriti_kapha || 0) },
      ],
    },
    reasoning: {
      prakritiReasoning: [`Dominant dosha: ${prakritiDominant}`, `Confidence: ${(scoring.prakriti_confidence || 0) * 100}%`],
      vikritiReasoning: [`Current imbalance: ${vikritiDominant}`, `Severity: ${scoring.vikriti_raw?.severity || 'low'}`],
      agniReasoning: [`Agni type: ${scoring.agni_type || 'sama'}`],
      amaReasoning: [`Ama level: ${scoring.ama_level || 'low'}`],
      foodPatternReasoning: [`Pattern: ${scoring.food_pattern_type || 'balanced'}`],
    },
    contradictions: [],
    dietDirection: {
      primaryDoshaToBalance: vikritiDominant,
      dietaryPrinciples: ['Eat according to dosha-balancing principles'],
      favoredTastes: [],
      reducedTastes: [],
      favoredQualities: [],
      reducedQualities: [],
    },
    weeklyMealPlan: { days: [], notes: ['Meal plan generation available in premium version'] },
    yogaExercise: { poses: [], sequence: [], durationMinutes: 30, frequencyPerWeek: 5, contraindications: [] },
    herbsFoodSupport: { herbs: [], contraindications: assessment.red_flag_detected ? ['Red flags detected - contraindicated'] : [], interactions: assessment.medications?.length > 0 ? ['Review medication interactions'] : [], noHerbMode: assessment.red_flag_detected || assessment.is_pregnant },
    medicalCautions: [
      ...(assessment.red_flag_detected ? [{ type: 'red_flag' as const, severity: 'high' as const, description: 'Red flag symptoms detected', recommendation: 'Recommend immediate medical consultation' }] : []),
      ...(assessment.is_pregnant ? [{ type: 'pregnancy' as const, severity: 'high' as const, description: 'Client is pregnant', recommendation: 'Avoid all herbs and strong dietary changes' }] : []),
    ],
    followUpQuestions: [
      { question: 'What is the client\'s primary health goal?', context: 'For personalized recommendation alignment', priority: 'high' },
    ],
  };
}
