import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    // Get the authenticated user via the browser session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client (service_role) to bypass RLS when querying assessments
    const admin = createAdminClient();

    // Find existing draft assessment
    const { data: existing, error: findError } = await admin
      .from('assessments')
      .select('id, current_step')
      .eq('client_id', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!findError && existing) {
      return NextResponse.json({ assessmentId: existing.id, currentStep: existing.current_step || 1 });
    }

    // Create new draft assessment
    const { data: created, error: createError } = await admin
      .from('assessments')
      .insert({ client_id: user.id })
      .select('id')
      .single();

    if (createError || !created) {
      console.error('Failed to create assessment:', createError);
      return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
    }

    return NextResponse.json({ assessmentId: created.id, currentStep: 1 });
  } catch (err) {
    console.error('init-assessment error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
