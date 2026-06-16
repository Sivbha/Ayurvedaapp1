'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.role !== 'admin') { router.push('/login'); }
          setUserName(data?.full_name || user.email || '');
        });
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r border-gray-200 bg-white">
        <div className="p-6">
          <h2 className="font-heading text-lg font-bold text-amber-900">Admin Panel</h2>
          <p className="mt-1 text-xs text-gray-500">{userName}</p>
        </div>
        <nav className="space-y-1 px-3">
          <Link href="/admin/practitioners" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
            pathname.startsWith('/admin/practitioners') ? 'bg-amber-50 text-amber-800 font-medium' : 'text-gray-600 hover:bg-gray-50'
          }`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
            Practitioners
          </Link>
          <Link href="/admin/assignments" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
            pathname === '/admin/assignments' ? 'bg-amber-50 text-amber-800 font-medium' : 'text-gray-600 hover:bg-gray-50'
          }`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7V3a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1h4v-2H5V4h6v3a1 1 0 001 1h3v1h2V7l-4-4z" /></svg>
            Assignments
          </Link>
          <Link href="/dashboard/clients" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            All Clients
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-gray-200 p-4">
          <button onClick={handleSignOut} className="flex items-center gap-3 text-sm text-gray-600 hover:text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
