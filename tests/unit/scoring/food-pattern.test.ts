import { describe, it, expect } from 'vitest';
import { analyzeFoodPattern } from '@/lib/scoring/food-pattern';
import { FoodDiaryEntry } from '@/types/assessment';

describe('analyzeFoodPattern', () => {
  it('should return balanced for no data', () => {
    const result = analyzeFoodPattern([]);
    expect(result.patternType).toBe('balanced');
  });

  it('should detect vata aggravating pattern from raw foods and skipped meals', () => {
    const diary: FoodDiaryEntry[] = Array(5).fill(null).map((_, i) => ({
      dayNumber: (i + 1) as 1|2|3|4|5|6|7,
      date: '2024-01-01',
      rawSalads: true,
      caffeine: true,
      leftovers: false, eatingOut: false, sugarSweets: false,
      spicyFoods: false, friedFoods: false, fermentedFoods: false,
      dairy: false, glutenWheat: false, beansLegumes: false,
      mealSize: 'small', eatingSpeed: 'fast', hungerBeforeMeals: 'low',
      symptomsAfterMeals: ['gas', 'bloating'],
    }));
    const result = analyzeFoodPattern(diary);
    expect(result.doshaImpact).toBeDefined();
    expect(result.keyFindings).toBeDefined();
  });

  it('should detect pitta aggravating from spicy foods', () => {
    const diary: FoodDiaryEntry[] = Array(7).fill(null).map((_, i) => ({
      dayNumber: (i + 1) as 1|2|3|4|5|6|7,
      date: '2024-01-01',
      spicyFoods: true,
      friedFoods: true,
      caffeine: true,
      leftovers: false, eatingOut: false, sugarSweets: false,
      rawSalads: false, fermentedFoods: false, dairy: false,
      glutenWheat: false, beansLegumes: false,
      mealSize: 'medium', eatingSpeed: 'moderate', hungerBeforeMeals: 'normal',
      symptomsAfterMeals: ['acidity'],
    }));
    const result = analyzeFoodPattern(diary);
    expect(result.keyFindings).toBeDefined();
  });
});
