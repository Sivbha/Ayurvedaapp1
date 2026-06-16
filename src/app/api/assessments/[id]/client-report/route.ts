import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateClientReport } from '@/lib/report/client';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: assessment } = await admin.from('assessments').select('*').eq('id', id).single();
  const { data: scoring } = await admin.from('scoring_results').select('*').eq('assessment_id', id).single();
  const { data: practitionerReport } = await admin.from('reports').select('content').eq('assessment_id', id).eq('type', 'practitioner').single();

  if (!assessment || !scoring) return NextResponse.json({ error: 'Assessment or scoring not found' }, { status: 404 });

  const report = generateClientReport(assessment, scoring, practitionerReport?.content || {});

  const { data, error } = await admin.from('reports').upsert({
    assessment_id: id, type: 'client', content: report,
  }, { onConflict: 'assessment_id, type' }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
