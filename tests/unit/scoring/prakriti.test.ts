import { describe, it, expect } from 'vitest';
import { calculatePrakriti } from '@/lib/scoring/prakriti';
import { PrakritiAnswer } from '@/types/assessment';

describe('calculatePrakriti', () => {
  it('should return vata dominant for vata-predominant answers', () => {
    const fixtures = require('../../fixtures/assessments/vata-prakriti.json');
    const allAnswers: PrakritiAnswer[] = [];
    
    for (const category of ['physical', 'metabolic', 'behavioral', 'psychological'] as const) {
      for (const a of fixtures.prakriti[category]) {
        allAnswers.push({ ...a, category, questionKey: a.questionKey || a.question_key, answerLabel: '' });
      }
    }

    const result = calculatePrakriti(allAnswers);
    expect(result.dominant).toBe('vata');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.normalized.vata).toBeGreaterThan(result.normalized.pitta);
    expect(result.normalized.vata).toBeGreaterThan(result.normalized.kapha);
  });

  it('should return valid scores for empty answers', () => {
    const result = calculatePrakriti([]);
    expect(result.scores.vata).toBe(0);
    expect(result.scores.pitta).toBe(0);
    expect(result.scores.kapha).toBe(0);
    expect(result.dominant).toBeDefined();
  });

  it('should handle single category answers', () => {
    const answers: PrakritiAnswer[] = [
      { category: 'physical', questionKey: 'body_frame', answerValue: 'large_heavy', answerLabel: '', doshaScores: { vata: 0, pitta: 0, kapha: 3 } },
    ];
    const result = calculatePrakriti(answers);
    expect(result.scores.kapha).toBeGreaterThan(0);
  });
});
