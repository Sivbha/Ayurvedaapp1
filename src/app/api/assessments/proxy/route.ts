import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED_TABLES = [
  'assessments',
  'prakriti_answers',
  'vikriti_answers',
  'food_diary_entries',
  'symptom_entries',
  'scoring_results',
  'reports',
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
      console.log(`[proxy] fetch ${table} filters=${JSON.stringify(filters)} rows=${result.data?.length ?? 0}`);
      return NextResponse.json(result);
    }

    if (action === 'upsert') {
      console.log(`[proxy] upsert ${table}:`, JSON.stringify(data));
      const q = admin.from(table).upsert(data, onConflict ? { onConflict } : undefined).select();
      const result = await (data?.single ? q.single() : q);
      console.log(`[proxy] upsert result:`, JSON.stringify(result));
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

    if (action === 'delete') {
      let query = admin.from(table).delete();
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          query = query.eq(key, val);
        });
      }
      const result = await query;
      console.log(`[proxy] delete ${table} filters=${JSON.stringify(filters)} status=${result.status ?? 200}`);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
