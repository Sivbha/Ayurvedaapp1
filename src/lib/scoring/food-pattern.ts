import { FoodPatternResult, FoodDiaryEntry, DoshaScores } from '@/types/assessment';
import foodRules from '@/lib/rules/food-classification.json';

export function analyzeFoodPattern(diary: FoodDiaryEntry[]): FoodPatternResult {
  const doshaImpact: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };
  const findings: string[] = [];
  
  if (diary.length === 0) {
    return { patternType: 'balanced', doshaImpact: { vata: 0, pitta: 0, kapha: 0 }, keyFindings: ['No food diary data'], recommendations: [] };
  }

  let skippedMeals = 0;
  let lateDinners = 0;
  let fastEating = 0;
  let largeMeals = 0;

  for (const day of diary) {
    // Food category checks
    const cats = foodRules.foodCategories as Record<string, { vata: number; pitta: number; kapha: number }>;
    if (day.caffeine) { doshaImpact.vata += cats.caffeine.vata; doshaImpact.pitta += cats.caffeine.pitta; }
    if (day.sugarSweets) { doshaImpact.vata += cats.sugar_sweets.vata; doshaImpact.pitta += cats.sugar_sweets.pitta; doshaImpact.kapha += cats.sugar_sweets.kapha; }
    if (day.friedFoods) { doshaImpact.vata += cats.fried_foods.vata; doshaImpact.pitta += cats.fried_foods.pitta; doshaImpact.kapha += cats.fried_foods.kapha; }
    if (day.spicyFoods) { doshaImpact.vata += cats.spicy_foods.vata; doshaImpact.pitta += cats.spicy_foods.pitta; doshaImpact.kapha += cats.spicy_foods.kapha; }
    if (day.fermentedFoods) { doshaImpact.vata += cats.fermented_foods.vata; doshaImpact.pitta += cats.fermented_foods.pitta; doshaImpact.kapha += cats.fermented_foods.kapha; }
    if (day.dairy) { doshaImpact.vata += cats.dairy.vata; doshaImpact.pitta += cats.dairy.pitta; doshaImpact.kapha += cats.dairy.kapha; }
    if (day.glutenWheat) { doshaImpact.vata += cats.gluten_wheat.vata; doshaImpact.pitta += cats.gluten_wheat.pitta; doshaImpact.kapha += cats.gluten_wheat.kapha; }
    if (day.beansLegumes) { doshaImpact.vata += cats.beans_legumes.vata; doshaImpact.pitta += cats.beans_legumes.pitta; doshaImpact.kapha += cats.beans_legumes.kapha; }
    if (day.rawSalads) { doshaImpact.vata += cats.raw_salads.vata; doshaImpact.pitta += cats.raw_salads.pitta; doshaImpact.kapha += cats.raw_salads.kapha; }
    if (day.leftovers) { doshaImpact.vata += cats.leftovers.vata; doshaImpact.pitta += cats.leftovers.pitta; doshaImpact.kapha += cats.leftovers.kapha; }
    if (day.eatingOut) { doshaImpact.vata += cats.eating_out.vata; doshaImpact.pitta += cats.eating_out.pitta; doshaImpact.kapha += cats.eating_out.kapha; }

    // Behavioral factors
    if (!day.breakfast?.food) skippedMeals++;
    if (day.dinner && day.dinner.time && parseInt(day.dinner.time) >= 19) lateDinners++;
    if (day.eatingSpeed === 'fast') fastEating++;
    if (day.mealSize === 'large') largeMeals++;
  }

  // Apply behavioral factor dosha impacts
  const behaviors = foodRules.behavioralFactors as Record<string, { vata: number; pitta: number; kapha: number }>;
  if (skippedMeals >= foodRules.thresholds.irregularMeals) {
    doshaImpact.vata += behaviors.skipped_meals.vata * skippedMeals;
    doshaImpact.pitta += behaviors.skipped_meals.pitta * skippedMeals;
    doshaImpact.kapha += behaviors.skipped_meals.kapha * skippedMeals;
    findings.push(`Skipped ${skippedMeals} breakfasts — irregular eating pattern aggravates Vata`);
  }
  if (lateDinners >= foodRules.thresholds.lateDinners) {
    doshaImpact.vata += behaviors.late_dinner.vata * lateDinners;
    doshaImpact.pitta += behaviors.late_dinner.pitta * lateDinners;
    doshaImpact.kapha += behaviors.late_dinner.kapha * lateDinners;
    findings.push(`${lateDinners} late dinners — impairs Agni and sleep quality`);
  }
  if (fastEating >= 3) findings.push('Consistently fast eating — poor digestion, Vata aggravation');

  // Determine pattern type
  const total = doshaImpact.vata + doshaImpact.pitta + doshaImpact.kapha;
  const normalized = total > 0 ? {
    vata: Math.round((doshaImpact.vata / total) * 100),
    pitta: Math.round((doshaImpact.pitta / total) * 100),
    kapha: Math.round((doshaImpact.kapha / total) * 100),
  } : { vata: 0, pitta: 0, kapha: 0 };

  let patternType: FoodPatternResult['patternType'];
  const dominant = foodRules.thresholds.dominant;

  if (skippedMeals >= 3) {
    patternType = 'irregular';
  } else if (normalized.vata >= dominant) {
    patternType = 'vata_aggravating';
  } else if (normalized.pitta >= dominant) {
    patternType = 'pitta_aggravating';
  } else if (normalized.kapha >= dominant) {
    patternType = 'kapha_aggravating';
  } else {
    patternType = 'balanced';
  }

  return { patternType, doshaImpact: normalized, keyFindings: findings, recommendations: [] };
}
