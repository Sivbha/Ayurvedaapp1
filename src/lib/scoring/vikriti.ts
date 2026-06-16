import { VikritiAnswer, VikritiResult, DoshaScores } from '@/types/assessment';
import vikritiRules from '@/lib/rules/vikriti-weights.json';
import { normalizeScores } from '@/lib/utils/dosha';

export function calculateVikriti(answers: VikritiAnswer[]): VikritiResult {
  const totals: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };
  const indicators: string[] = [];
  let indicatorCount = 0;

  for (const answer of answers) {
    if (answer.severity === 0) continue;

    const category = answer.category as keyof typeof vikritiRules.categories;
    const catQuestions: Record<string, { label: string; doshaImpact: { vata: number; pitta: number; kapha: number } }> = vikritiRules.categories[category] as any;
    const question = catQuestions?.[answer.questionKey];
    
    if (!question) continue;

    const multiplier = vikritiRules.severityMultiplier[answer.severity.toString() as keyof typeof vikritiRules.severityMultiplier] || 0;
    totals.vata += question.doshaImpact.vata * multiplier;
    totals.pitta += question.doshaImpact.pitta * multiplier;
    totals.kapha += question.doshaImpact.kapha * multiplier;

    if (answer.severity >= 2 && indicatorCount < 10) {
      indicators.push(`${question.label}: severity ${answer.severity}/3`);
      indicatorCount++;
    }
  }

  const normalized = normalizeScores(totals);
  const totalScore = totals.vata + totals.pitta + totals.kapha;
  const sorted = Object.entries(normalized).sort(([, a], [, b]) => b - a);
  const dominant = sorted[0][0] as keyof DoshaScores;
  const severity = totalScore >= vikritiRules.thresholds.moderate ? 'high' : 
                   totalScore >= vikritiRules.thresholds.low ? 'moderate' : 'low';

  return {
    scores: totals,
    normalized,
    dominant,
    severity,
    keyIndicators: indicators,
    explanation: generateVikritiExplanation(normalized, indicators),
    rawAnswers: answers,
  };
}

function generateVikritiExplanation(normalized: DoshaScores, indicators: string[]): string {
  const parts: string[] = [];
  if (normalized.vata >= 35) parts.push('Vata imbalance with symptoms of irregularity, dryness, or instability');
  if (normalized.pitta >= 35) parts.push('Pitta imbalance with symptoms of heat, inflammation, or intensity');
  if (normalized.kapha >= 35) parts.push('Kapha imbalance with symptoms of congestion, lethargy, or heaviness');
  if (indicators.length > 0) parts.push(`Key indicators: ${indicators.slice(0, 3).join(', ')}`);
  return parts.join('. ') || 'Current imbalance is minimal or balanced';
}
