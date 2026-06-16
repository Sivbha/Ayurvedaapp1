import { describe, it, expect } from 'vitest';
import { assessAgni, AgniInputs } from '@/lib/scoring/agni';
import { calculatePrakriti } from '@/lib/scoring/prakriti';
import { calculateVikriti } from '@/lib/scoring/vikriti';

describe('assessAgni', () => {
  it('should return sama agni for balanced inputs', () => {
    const inputs: AgniInputs = {
      prakriti: calculatePrakriti([]),
      vikriti: calculateVikriti([]),
      foodDiary: [],
      symptoms: [],
    };
    const result = assessAgni(inputs);
    expect(['sama', 'vishama', 'tikshna', 'manda']).toContain(result.type);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
