'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, isAdmin } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/login');
      return;
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <nav className="flex gap-6 border-b border-border pb-4 text-sm">
        <Link href="/admin/products" className="text-ink hover:underline">Products</Link>
        <Link href="/admin/orders" className="text-ink hover:underline">Orders</Link>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}