import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculatePrakriti } from '@/lib/scoring/prakriti';
import { calculateVikriti } from '@/lib/scoring/vikriti';
import { assessAgni } from '@/lib/scoring/agni';
import { assessAma } from '@/lib/scoring/ama';
import { analyzeFoodPattern } from '@/lib/scoring/food-pattern';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch all data
  const [prakritiRes, vikritiRes, foodRes, symptomRes] = await Promise.all([
    supabase.from('prakriti_answers').select('*').eq('assessment_id', id),
    supabase.from('vikriti_answers').select('*').eq('assessment_id', id),
    supabase.from('food_diary_entries').select('*').eq('assessment_id', id),
    supabase.from('symptom_entries').select('*').eq('assessment_id', id),
  ]);

  // Map to domain types
  const prakritiAnswers = (prakritiRes.data || []).map((a: any) => ({
    category: a.category, questionKey: a.question_key, answerValue: a.answer_value,
    answerLabel: a.answer_label || '', doshaScores: a.dosha_scores || { vata: 0, pitta: 0, kapha: 0 },
  }));

  const vikritiAnswers = (vikritiRes.data || []).map((a: any) => ({
    category: a.category, questionKey: a.question_key, severity: a.severity,
    durationWeeks: a.duration_weeks, doshaImpact: a.dosha_impact || { vata: 0, pitta: 0, kapha: 0 },
  }));

  const foodDiary = (foodRes.data || []).map((d: any) => ({
    dayNumber: d.day_number, date: d.date, wakeTime: d.wake_time,
    breakfast: d.breakfast, lunch: d.lunch, dinner: d.dinner, snacks: d.snacks,
    caffeine: d.caffeine, sugarSweets: d.sugar_sweets, friedFoods: d.fried_foods,
    spicyFoods: d.spicy_foods, fermentedFoods: d.fermented_foods,
    dairy: d.dairy, glutenWheat: d.gluten_wheat, beansLegumes: d.beans_legumes,
    rawSalads: d.raw_salads, leftovers: d.leftovers, eatingOut: d.eating_out,
    mealSize: d.meal_size, eatingSpeed: d.eating_speed,
    hungerBeforeMeals: d.hunger_before_meals, symptomsAfterMeals: d.symptoms_after_meals || [],
  }));

  const symptoms = (symptomRes.data || []).map((s: any) => ({
    category: s.category, symptoms: s.symptoms || [], severity: s.severity, notes: s.notes,
  }));

  // Run scoring engines
  const prakritiResult = calculatePrakriti(prakritiAnswers);
  const vikritiResult = calculateVikriti(vikritiAnswers);
  const agniResult = assessAgni({ prakriti: prakritiResult, vikriti: vikritiResult, foodDiary, symptoms });
  const amaResult = assessAma({ prakriti: prakritiResult, vikriti: vikritiResult, foodDiary, symptoms });
  const foodPatternResult = analyzeFoodPattern(foodDiary);

  // Store scoring results
  const { error } = await supabase.from('scoring_results').upsert({
    assessment_id: id,
    prakriti_vata: prakritiResult.normalized.vata, prakriti_pitta: prakritiResult.normalized.pitta, prakriti_kapha: prakritiResult.normalized.kapha,
    prakriti_dominant: prakritiResult.dominant, prakriti_confidence: prakritiResult.confidence, prakriti_raw: prakritiResult,
    vikriti_vata: vikritiResult.normalized.vata, vikriti_pitta: vikritiResult.normalized.pitta, vikriti_kapha: vikritiResult.normalized.kapha,
    vikriti_dominant: vikritiResult.dominant, vikriti_confidence: vikritiResult.normalized.vata + vikritiResult.normalized.pitta + vikritiResult.normalized.kapha > 0 ? 0.7 : 0,
    vikriti_raw: vikritiResult,
    agni_type: agniResult.type, agni_score: agniResult.score, agni_notes: agniResult.description,
    ama_score: amaResult.score, ama_indicators: amaResult.indicators, ama_level: amaResult.level,
    food_pattern_type: foodPatternResult.patternType, food_pattern_notes: foodPatternResult.keyFindings.join('; '), food_pattern_raw: foodPatternResult,
    computed_at: new Date().toISOString(),
  }, { onConflict: 'assessment_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    prakriti: prakritiResult, vikriti: vikritiResult,
    agni: agniResult, ama: amaResult, foodPattern: foodPatternResult,
  });
}
