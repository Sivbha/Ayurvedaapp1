import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED_TABLES = [
  'assessments',
  'prakriti_answers',
  'vikriti_answers',
  'food_diary_entries',
  'symptom_entries',
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, table, data, filters, onConflict } = body;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    const admin = createAdminClient();

    if (action === 'fetch') {
      let query = admin.from(table).select(data?.select || '*');
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          query = query.eq(key, val);
        });
      }
      if (data?.order) query = query.order(data.order.column, { ascending: data.order.ascending ?? false });
      if (data?.limit) query = query.limit(data.limit);
      const result = await (data?.single ? query.single() : data?.maybeSingle ? query.maybeSingle() : query);
      return NextResponse.json(result);
    }

    if (action === 'upsert') {
      const q = admin.from(table).upsert(data, onConflict ? { onConflict } : undefined).select();
      const result = await (data?.single ? q.single() : q);
      return NextResponse.json(result);
    }

    if (action === 'update') {
      let query = admin.from(table).update(data).select();
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          query = query.eq(key, val);
        });
      }
      if (data?.single) {
        const result = await query.single();
        return NextResponse.json(result);
      }
      const result = await query;
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
