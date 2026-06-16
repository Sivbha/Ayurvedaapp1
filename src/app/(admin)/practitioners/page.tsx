'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function PractitionersPage() {
  const supabase = createClient();
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/practitioners').then(r => r.json()).then(setPractitioners).catch(() => {});
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/admin/practitioners', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: name }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Invitation sent to ${email}`);
      setEmail(''); setName(''); setShowInvite(false);
      const updated = await fetch('/api/admin/practitioners').then(r => r.json());
      setPractitioners(updated);
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Remove practitioner access for this user?')) return;
    await fetch(`/api/admin/practitioners/${id}`, { method: 'DELETE' });
    setPractitioners(practitioners.filter(p => p.id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Practitioners</h1>
        <button onClick={() => setShowInvite(!showInvite)}
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
          {showInvite ? 'Cancel' : 'Invite Practitioner'}
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-medium text-gray-900">Invite New Practitioner</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none" />
          </div>
          <button type="submit" className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
            Send Invitation
          </button>
          {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {practitioners.map((p: any) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.full_name || 'Unnamed'}</td>
                <td className="px-4 py-3 text-gray-600">{p.email || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">
                  {p.role !== 'admin' && (
                    <button onClick={() => handleDeactivate(p.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-800">Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
            {practitioners.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No practitioners found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
