'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isAuthenticated, clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  function handleLogout() {
    clearAuth();
    setLoggedIn(false);
    router.push('/login');
  }

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/products" className="text-lg font-semibold tracking-tight">
          Trailhead
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/products" className="hover:text-stone-600">Shop</Link>
          <Link href="/cart" className="hover:text-stone-600">Cart</Link>
          {loggedIn ? (
            <>
              <Link href="/orders" className="hover:text-stone-600">Orders</Link>
              <button onClick={handleLogout} className="hover:text-stone-600">Log out</button>
            </>
          ) : (
            <Link href="/login" className="hover:text-stone-600">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}