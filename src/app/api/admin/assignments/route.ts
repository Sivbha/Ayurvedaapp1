import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const admin = createAdminClient();
  const { assessmentId, practitionerId } = await request.json();

  if (!assessmentId || !practitionerId) {
    return NextResponse.json({ error: 'assessmentId and practitionerId required' }, { status: 400 });
  }

  const { error } = await admin.from('assessments').update({ practitioner_id: practitionerId }).eq('id', assessmentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: profile } = await admin.from('profiles').select('email, full_name').eq('id', practitionerId).single();

  return NextResponse.json({ success: true, practitioner: profile });
}
