import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePractitionerReport } from '@/lib/report/practitioner';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch assessment + scoring
  const { data: assessment } = await supabase.from('assessments').select('*').eq('id', id).single();
  const { data: scoring } = await supabase.from('scoring_results').select('*').eq('assessment_id', id).single();

  if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  if (!scoring) return NextResponse.json({ error: 'Scoring not found. Run scoring first.' }, { status: 400 });

  const report = generatePractitionerReport(assessment, scoring);

  const { data, error } = await supabase.from('reports').upsert({
    assessment_id: id, type: 'practitioner', content: report,
  }, { onConflict: 'assessment_id, type' }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
