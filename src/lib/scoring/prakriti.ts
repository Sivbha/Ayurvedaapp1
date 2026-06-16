import { PrakritiAnswer, PrakritiResult, DoshaScores, ConstitutionType } from '@/types/assessment';
import prakritiRules from '@/lib/rules/prakriti-weights.json';
import { normalizeScores, determineDominant } from '@/lib/utils/dosha';

interface OptionsMap {
  [key: string]: { label: string; dosha: DoshaScores };
}

interface QuestionConfig {
  label: string;
  type: string;
  options: OptionsMap;
}

export function calculatePrakriti(answers: PrakritiAnswer[]): PrakritiResult {
  const rawScores: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };

  for (const answer of answers) {
    const category = answer.category as keyof typeof prakritiRules.questions;
    const catRules = prakritiRules.questions[category];
    const question = catRules?.[answer.questionKey as keyof typeof catRules] as QuestionConfig | undefined;
    
    if (!question) continue;

    const categoryWeight = prakritiRules.categoryWeights[category as keyof typeof prakritiRules.categoryWeights] || 1;
    const option = question.options[answer.answerValue];
    
    if (option?.dosha) {
      rawScores.vata += option.dosha.vata * categoryWeight;
      rawScores.pitta += option.dosha.pitta * categoryWeight;
      rawScores.kapha += option.dosha.kapha * categoryWeight;
    }
  }

  const normalized = normalizeScores(rawScores);
  const { dominant, confidence } = determineDominant(normalized, prakritiRules.thresholds.dominantSingle, prakritiRules.thresholds.dualTypeGap);

  return {
    scores: rawScores,
    normalized,
    dominant,
    confidence,
    explanation: generatePrakritiExplanation(normalized),
    rawAnswers: answers,
  };
}

function generatePrakritiExplanation(normalized: DoshaScores): string {
  const parts: string[] = [];
  if (normalized.vata >= 40) parts.push('Strong Vata indicators: variable appetite, dry qualities, active mind, irregular tendencies');
  if (normalized.pitta >= 40) parts.push('Strong Pitta indicators: sharp digestion, intense energy, focused mind, heat sensitivity');
  if (normalized.kapha >= 40) parts.push('Strong Kapha indicators: steady energy, stable digestion, calm mind, cooling qualities');
  return parts.length > 0 ? parts.join('. ') : 'Relatively balanced constitution with no single dosha strongly predominant';
}
