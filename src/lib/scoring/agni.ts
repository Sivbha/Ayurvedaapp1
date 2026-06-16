import { AgniResult, AgniType, DoshaScores, AgniInputs } from '@/types/assessment';
import agniRules from '@/lib/rules/agni-rules.json';

export function assessAgni(inputs: AgniInputs): AgniResult {
  const scores: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };

  // Vikriti digestive impact (40%)
  scores.vata += inputs.vikriti.normalized.vata * 0.4 * 0.4;
  scores.pitta += inputs.vikriti.normalized.pitta * 0.4 * 0.4;
  scores.kapha += inputs.vikriti.normalized.kapha * 0.4 * 0.4;

  // Food diary impact (30%)
  for (const day of inputs.foodDiary) {
    if (day.mealSize === 'large' && day.eatingSpeed === 'fast') scores.vata += 3;
    if (day.spicyFoods) scores.pitta += 3;
    if (day.friedFoods) scores.pitta += 2;
    if (day.leftovers) scores.kapha += 2;
    if (day.dairy) scores.kapha += 1;
    if (!day.breakfast) scores.vata += 2;
  }

  // Symptom impact (30%)
  for (const s of inputs.symptoms) {
    if (s.category === 'digestion') {
      for (const sym of s.symptoms) {
        const score = agniRules.symptomScores[sym as keyof typeof agniRules.symptomScores];
        if (score) {
          scores.vata += score.vata;
          scores.pitta += score.pitta;
          scores.kapha += score.kapha;
        }
      }
    }
  }

  const total = scores.vata + scores.pitta + scores.kapha;

  let type: AgniType;
  let score: number;

  if (total <= agniRules.thresholds.samaMax) {
    type = 'sama';
    score = 100 - total;
  } else if (scores.vata >= scores.pitta && scores.vata >= scores.kapha) {
    type = 'vishama';
    score = scores.vata;
  } else if (scores.pitta >= scores.vata && scores.pitta >= scores.kapha) {
    type = 'tikshna';
    score = scores.pitta;
  } else {
    type = 'manda';
    score = scores.kapha;
  }

  return {
    type,
    score: Math.min(100, Math.max(0, Math.round(score))),
    description: agniRules.agniDescriptions[type as keyof typeof agniRules.agniDescriptions] || '',
    recommendations: agniRules.agniRecommendations[type as keyof typeof agniRules.agniRecommendations] || [],
  };
}
