'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuth } from '@/lib/auth';

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
    <header className="border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/products" className="font-display text-xl">
          Trailhead
        </Link>
        <nav className="flex items-center gap-7 text-sm text-ink">
          <Link href="/products" className="link-underline">Shop</Link>
          <Link href="/cart" className="link-underline">Cart</Link>
          {loggedIn ? (
            <>
              <Link href="/orders" className="link-underline">Orders</Link>
              <button onClick={handleLogout} className="link-underline">Log out</button>
            </>
          ) : (
            <Link href="/login" className="link-underline">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}