import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notifyClientReportReleased } from '@/lib/email';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { error: assessError } = await supabase.from('assessments').update({
    status: 'released', reviewed_at: new Date().toISOString(), released_at: new Date().toISOString(),
  }).eq('id', id);

  if (assessError) return NextResponse.json({ error: assessError.message }, { status: 500 });

  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/assessments/${id}/client-report`, { method: 'POST' });

  await supabase.from('reports').update({ released_at: new Date().toISOString() })
    .eq('assessment_id', id).eq('type', 'client');

  const admin = createAdminClient();
  const { data: assessment } = await admin.from('assessments').select('email, full_name').eq('id', id).single();
  if (assessment?.email) {
    notifyClientReportReleased(assessment.email, assessment.full_name || 'there',
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/report/${id}`).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
