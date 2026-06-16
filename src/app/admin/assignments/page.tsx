'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AssignmentsPage() {
  const supabase = createClient();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('assessments').select('*').order('created_at', { ascending: false }),
      fetch('/api/admin/practitioners').then(r => r.json()),
    ]).then(([assessRes, pracData]) => {
      setAssessments(assessRes.data || []);
      setPractitioners(pracData || []);
    });
  }, []);

  const handleAssign = async (assessmentId: string, practitionerId: string) => {
    setMessage('');
    const res = await fetch('/api/admin/assignments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId, practitionerId: practitionerId || null }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Assignment updated');
      setAssessments(assessments.map(a => a.id === assessmentId ? { ...a, practitioner_id: practitionerId || null } : a));
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Client Assignments</h1>

      {message && <p className="mb-4 text-sm text-gray-600">{message}</p>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Client</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Assigned Practitioner</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a: any) => {
              const assignedPrac = practitioners.find((p: any) => p.id === a.practitioner_id);
              return (
                <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.full_name || 'Unnamed'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.status === 'released' ? 'bg-green-100 text-green-700' : a.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{assignedPrac?.full_name || assignedPrac?.email || 'Unassigned'}</td>
                  <td className="px-4 py-3">
                    <select value={a.practitioner_id || ''} onChange={(e) => handleAssign(a.id, e.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none">
                      <option value="">Unassigned</option>
                      {practitioners.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {assessments.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No clients found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
