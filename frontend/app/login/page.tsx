'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthResponse } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api';
import { setAuth } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });
      setAuth(data.token, data.userId, data.role);
      router.push(data.role === 'ADMIN' ? '/admin/products' : '/products');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-display text-3xl">Log in</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label htmlFor="email" className="text-sm text-ink">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm text-ink">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        {errorMessage && <p className="text-sm text-error">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-accent py-3 text-sm text-white transition-colors hover:bg-ink disabled:opacity-40"
        >
          {status === 'loading' ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
}