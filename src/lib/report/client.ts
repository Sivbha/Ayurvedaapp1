import { ClientReport } from '@/types/report';

export function generateClientReport(assessment: any, scoring: any, practitionerContent: any): ClientReport {
  return {
    metadata: {
      assessmentId: assessment.id,
      generatedAt: new Date().toISOString(),
    },
    likelyConstitution: {
      type: scoring.prakriti_dominant || 'balanced',
      description: `Your natural constitution appears to be ${scoring.prakriti_dominant || 'balanced'}. This is your unique blueprint.`,
      strengths: ['Review your personalized recommendations below'],
      challenges: ['Understanding your imbalances is the first step to wellness'],
    },
    currentImbalance: {
      pattern: scoring.vikriti_dominant || 'balanced',
      description: `You are currently experiencing a ${scoring.vikriti_dominant || 'balanced'} pattern.`,
      mainSymptoms: scoring.vikriti_raw?.keyIndicators?.map((i: string) => i.split(':')[0]) || [],
      aggravatedDosha: scoring.vikriti_dominant || 'none',
    },
    foodPatternInsight: scoring.food_pattern_notes || 'Your eating patterns show room for optimization.',
    foodsToFavour: [
      { name: 'Warm, cooked foods', examples: ['Soups', 'Stews', 'Kitchari'], reason: 'Easier to digest', frequency: 'daily' },
      { name: 'Seasonal vegetables', examples: ['Root vegetables', 'Leafy greens'], reason: 'Nutrient dense', frequency: 'daily' },
    ],
    foodsToReduce: [
      { name: 'Processed foods', examples: ['Packaged snacks', 'Fast food'], reason: 'Hard to digest', frequency: '1-2x_week' },
      { name: 'Cold/raw foods', examples: ['Cold salads', 'Ice cream'], reason: 'Dampens digestion', frequency: '1-2x_week' },
    ],
    sampleWeeklyMealPlan: { days: [], notes: ['See practitioner report for detailed meal plan'] },
    gentleMovement: { type: 'yoga', durationMinutes: 30, frequencyPerWeek: 5, specificRecommendations: ['Gentle yoga', 'Walking'], avoid: ['Exhausting exercise'] },
    breathwork: { techniques: [{ name: 'Deep Belly Breathing', sanskritName: 'Dirga Pranayama', instructions: ['Sit comfortably', 'Inhale deeply into belly', 'Exhale slowly'], benefits: ['Calms nervous system'], contraindications: [] }], durationMinutes: 10, frequencyPerDay: 2 },
    gutSupport: { recommendations: [{ title: 'Warm water', description: 'Sip warm water throughout the day', evidence: 'Ayurvedic tradition' }], foodsToInclude: ['Ginger', 'Cumin', 'Fennel'], foodsToAvoid: ['Cold drinks', 'Leftovers'] },
    whenToSeekHelp: {
      items: assessment.red_flags?.length > 0 ? assessment.red_flags.map((r: string) => ({ symptom: r, action: 'Consult your doctor immediately', urgency: 'immediate' as const })) : [],
      disclaimer: 'This is not medical advice. Always consult a qualified healthcare provider.',
    },
    disclaimer: 'This report is for educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before making changes to your health routine.',
  };
}
