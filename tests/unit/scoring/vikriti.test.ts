import { describe, it, expect } from 'vitest';
import { calculateVikriti } from '@/lib/scoring/vikriti';
import { VikritiAnswer } from '@/types/assessment';

describe('calculateVikriti', () => {
  it('should return pitta dominant for pitta-predominant symptoms', () => {
    const answers: VikritiAnswer[] = [
      { category: 'digestive', questionKey: 'acidity_burning', severity: 3, doshaImpact: { vata: 0, pitta: 3, kapha: 0 } },
      { category: 'energy_mood', questionKey: 'irritability', severity: 2, doshaImpact: { vata: 0, pitta: 3, kapha: 0 } },
    ];
    const result = calculateVikriti(answers);
    expect(result.dominant).toBe('pitta');
    expect(result.severity).toBe('moderate');
  });

  it('should return vata imbalance for gas and constipation', () => {
    const answers: VikritiAnswer[] = [
      { category: 'digestive', questionKey: 'gas_bloating', severity: 2, doshaImpact: { vata: 2, pitta: 0, kapha: 1 } },
      { category: 'digestive', questionKey: 'constipation', severity: 2, doshaImpact: { vata: 3, pitta: 0, kapha: 1 } },
    ];
    const result = calculateVikriti(answers);
    expect(result.normalized.vata).toBeGreaterThan(result.normalized.pitta);
  });

  it('should return low severity for minimal symptoms', () => {
    const answers: VikritiAnswer[] = [
      { category: 'digestive', questionKey: 'gas_bloating', severity: 1, doshaImpact: { vata: 2, pitta: 0, kapha: 1 } },
    ];
    const result = calculateVikriti(answers);
    expect(result.severity).toBe('low');
  });

  it('should handle empty answers', () => {
    const result = calculateVikriti([]);
    expect(result.scores.vata).toBe(0);
    expect(result.severity).toBe('low');
  });
});
