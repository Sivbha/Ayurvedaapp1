'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  draft: 'In Progress', submitted: 'Submitted', in_review: 'In Review',
  released: 'Released', archived: 'Archived',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700', submitted: 'bg-blue-100 text-blue-700',
  in_review: 'bg-yellow-100 text-yellow-700', released: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-700',
};

export default function ClientsPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    supabase.from('assessments').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setClients(data || []));
  }, []);

  const filtered = clients.filter(c => {
    const matchesSearch = !search || (c.full_name || '').toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <span className="text-sm text-gray-500">{clients.length} total</span>
      </div>

      <div className="mb-4 flex gap-3">
        <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none w-64" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="draft">In Progress</option>
          <option value="submitted">Submitted</option>
          <option value="in_review">In Review</option>
          <option value="released">Released</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Submitted</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c: any) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.full_name || 'Unnamed'}</td>
                <td className="px-4 py-3 text-gray-600">{c.email || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[c.status] || c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/clients/${c.id}`} className="text-amber-700 hover:text-amber-800 font-medium text-xs">View</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No clients found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
