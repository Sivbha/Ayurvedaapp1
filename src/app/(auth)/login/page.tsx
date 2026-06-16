'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.refresh();
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Enter your email first'); return; }
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    
    if (error) { setError(error.message); setLoading(false); return; }
    setMagicLinkSent(true);
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-green-700">Check your email</h2>
        <p className="mt-2 text-gray-600">A magic link has been sent to {email}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
      <p className="mt-1 text-sm text-gray-500">Access your assessment or dashboard</p>
      
      <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button onClick={handleMagicLink} disabled={loading} className="text-sm text-amber-700 hover:text-amber-800">
          Send magic link instead
        </button>
      </div>
      
      <p className="mt-4 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-amber-700 hover:text-amber-800">Sign up</Link>
      </p>
    </div>
  );
}
