import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.from('profiles').select('*').in('role', ['practitioner', 'admin']).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const admin = createAdminClient();
  const body = await request.json();
  const { email, full_name } = body;

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

  const { data: existing } = await admin.from('profiles').select('id, full_name').eq('id', (await admin.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id || '').single();
  if (existing) {
    const { error } = await admin.from('profiles').update({ role: 'practitioner', full_name: full_name || (existing as any).full_name }).eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const { data: newUser, error: createError } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name, role: 'practitioner' } });
  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });

  const { error: profileError } = await admin.from('profiles').upsert({ id: newUser.user.id, role: 'practitioner', full_name });
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({ success: true, user: newUser.user }, { status: 201 });
}
