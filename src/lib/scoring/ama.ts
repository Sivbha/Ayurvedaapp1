import { AmaResult, AmaLevel, AgniInputs } from '@/types/assessment';
import amaRules from '@/lib/rules/ama-rules.json';

export function assessAma(inputs: AgniInputs): AmaResult {
  let score = 0;
  const indicators: string[] = [];

  // Symptom indicators (30%)
  for (const s of inputs.symptoms) {
    for (const sym of s.symptoms) {
      if (amaRules.amaSymptoms.includes(sym)) {
        score += 5;
        if (!indicators.includes(sym)) indicators.push(sym);
      }
    }
  }

  // Food indicators (40%)
  for (const day of inputs.foodDiary) {
    if (day.leftovers) score += (amaRules.foodIndicators as Record<string, number>).leftovers;
    if (day.friedFoods) score += (amaRules.foodIndicators as Record<string, number>).fried_foods;
    if (day.eatingOut) score += (amaRules.foodIndicators as Record<string, number>).eating_out;
    if (day.sugarSweets) score += (amaRules.foodIndicators as Record<string, number>).sugar_sweets;
    if (day.dairy && !day.spicyFoods) score += (amaRules.foodIndicators as Record<string, number>).dairy;
  }

  // Vikriti contribution (30%) - Vata-Kapha combination indicates Ama
  if (inputs.vikriti.normalized.vata > 30 && inputs.vikriti.normalized.kapha > 25) {
    score += 10;
    indicators.push('Vata-Kapha digestive imbalance');
  }

  const level: AmaLevel = score >= amaRules.thresholds.moderate ? 'high' :
                          score >= amaRules.thresholds.low ? 'moderate' : 'low';

  return {
    score: Math.min(100, score),
    level,
    indicators,
    recommendations: amaRules.amaRecommendations[level as keyof typeof amaRules.amaRecommendations] || [],
  };
}
