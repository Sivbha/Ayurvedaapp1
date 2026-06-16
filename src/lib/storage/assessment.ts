import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

export class AssessmentStorage {
  static async create(clientId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assessments')
      .insert({ client_id: clientId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Record<string, unknown>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assessments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async listByClient(clientId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async listByPractitioner(practitionerId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async savePrakritiAnswers(assessmentId: string, category: string, answers: unknown[]) {
    const supabase = await createClient();
    const rows = answers.map((a: any) => ({
      assessment_id: assessmentId,
      category,
      question_key: a.questionKey,
      answer_value: a.answerValue,
      answer_label: a.answerLabel,
      dosha_scores: a.doshaScores,
    }));
    const { error } = await supabase.from('prakriti_answers').insert(rows);
    if (error) throw error;
  }

  static async saveVikritiAnswers(assessmentId: string, category: string, answers: unknown[]) {
    const supabase = await createClient();
    const rows = answers.map((a: any) => ({
      assessment_id: assessmentId,
      category,
      question_key: a.questionKey,
      severity: a.severity,
      duration_weeks: a.durationWeeks,
      dosha_impact: a.doshaImpact,
    }));
    const { error } = await supabase.from('vikriti_answers').insert(rows);
    if (error) throw error;
  }

  static async saveFoodDiaryDay(assessmentId: string, day: any) {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('food_diary_entries')
      .select('id')
      .eq('assessment_id', assessmentId)
      .eq('day_number', day.dayNumber)
      .single();

    const row = {
      assessment_id: assessmentId,
      day_number: day.dayNumber,
      date: day.date,
      wake_time: day.wakeTime,
      breakfast: day.breakfast,
      lunch: day.lunch,
      dinner: day.dinner,
      snacks: day.snacks,
      caffeine: day.caffeine,
      sugar_sweets: day.sugarSweets,
      fried_foods: day.friedFoods,
      spicy_foods: day.spicyFoods,
      fermented_foods: day.fermentedFoods,
      dairy: day.dairy,
      gluten_wheat: day.glutenWheat,
      beans_legumes: day.beansLegumes,
      raw_salads: day.rawSalads,
      leftovers: day.leftovers,
      eating_out: day.eatingOut,
      meal_size: day.mealSize,
      eating_speed: day.eatingSpeed,
      hunger_before_meals: day.hungerBeforeMeals,
      symptoms_after_meals: day.symptomsAfterMeals,
    };

    if (existing) {
      const { error } = await supabase.from('food_diary_entries').update(row).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('food_diary_entries').insert(row);
      if (error) throw error;
    }
  }

  static async submitAssessment(id: string) {
    return this.update(id, { status: 'submitted', submitted_at: new Date().toISOString() });
  }
}
