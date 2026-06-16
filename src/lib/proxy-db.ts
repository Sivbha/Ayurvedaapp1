export async function proxyFetch(table: string, filters?: Record<string, any>, opts?: { single?: boolean; maybeSingle?: boolean; order?: { column: string; ascending?: boolean }; limit?: number; select?: string }) {
  const res = await fetch('/api/assessments/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'fetch', table, filters, data: opts }),
  });
  if (!res.ok) throw new Error(`proxy fetch failed: ${res.status}`);
  return res.json();
}

export async function proxyUpsert(table: string, data: any, onConflict?: string) {
  const res = await fetch('/api/assessments/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upsert', table, data, onConflict }),
  });
  if (!res.ok) throw new Error(`proxy upsert failed: ${res.status}`);
  return res.json();
}

export async function proxyUpdate(table: string, data: any, filters: Record<string, any>) {
  const res = await fetch('/api/assessments/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', table, data, filters }),
  });
  if (!res.ok) throw new Error(`proxy update failed: ${res.status}`);
  return res.json();
}

export async function proxyDelete(table: string, filters: Record<string, any>) {
  const res = await fetch('/api/assessments/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', table, filters }),
  });
  if (!res.ok) throw new Error(`proxy delete failed: ${res.status}`);
  return res.json();
}
