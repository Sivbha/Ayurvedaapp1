import { describe, it, expect } from 'vitest';
import { assessAma } from '@/lib/scoring/ama';
import { calculatePrakriti } from '@/lib/scoring/prakriti';
import { calculateVikriti } from '@/lib/scoring/vikriti';
import type { AgniInputs } from '@/lib/scoring/agni';

describe('assessAma', () => {
  it('should return low ama for clean inputs', () => {
    const inputs: AgniInputs = {
      prakriti: calculatePrakriti([]),
      vikriti: calculateVikriti([]),
      foodDiary: [],
      symptoms: [],
    };
    const result = assessAma(inputs);
    expect(result.level).toBe('low');
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should detect ama from symptoms', () => {
    const inputs: AgniInputs = {
      prakriti: calculatePrakriti([]),
      vikriti: calculateVikriti([]),
      foodDiary: [],
      symptoms: [{ category: 'digestion', symptoms: ['fatigue', 'coated_tongue', 'brain_fog'] }],
    };
    const result = assessAma(inputs);
    expect(result.score).toBeGreaterThan(0);
  });
});
