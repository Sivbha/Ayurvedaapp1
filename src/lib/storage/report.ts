import { createClient } from '@/lib/supabase/server';

export class ReportStorage {
  static async create(assessmentId: string, type: 'practitioner' | 'client', content: unknown) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .insert({ assessment_id: assessmentId, type, content })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getByAssessment(assessmentId: string, type: 'practitioner' | 'client') {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('type', type)
      .single();
    if (error) return null;
    return data;
  }

  static async release(assessmentId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .update({ released_at: new Date().toISOString() })
      .eq('assessment_id', assessmentId)
      .eq('type', 'client');
    if (error) throw error;
    return data;
  }
}
