import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Update assessment status
  const { error: assessError } = await supabase.from('assessments').update({
    status: 'released', reviewed_at: new Date().toISOString(), released_at: new Date().toISOString(),
  }).eq('id', id);

  if (assessError) return NextResponse.json({ error: assessError.message }, { status: 500 });

  // Generate client report
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/assessments/${id}/client-report`, { method: 'POST' });

  // Mark client report as released
  await supabase.from('reports').update({ released_at: new Date().toISOString() })
    .eq('assessment_id', id).eq('type', 'client');

  return NextResponse.json({ success: true });
}
