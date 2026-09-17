'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api';
import { isAuthenticated, getUserId } from '@/lib/auth';

type Stage = 'loading' | 'ready' | 'error';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Payment pending',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stage, setStage] = useState<Stage>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, []);

  async function loadOrders() {
    setStage('loading');
    try {
      const userId = getUserId();
      const data = await apiFetch<Order[]>(`/orders/${userId}`);
      setOrders(data);
      setStage('ready');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong');
      setStage('error');
    }
  }

  if (stage === 'loading') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="h-9 w-48 animate-pulse bg-surface" />
        <div className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-xl">Couldn&apos;t load your orders</h2>
        <p className="mt-2 text-sm text-muted">{errorMessage}</p>
        <button
          onClick={loadOrders}
          className="mt-6 border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-background"
        >
          Try again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-xl">No orders yet</h2>
        <p className="mt-2 text-sm text-muted">Your order history will appear here.</p>
        <Link
          href="/products"
          className="mt-6 inline-block border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-background"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-display text-3xl">Order history</h1>

      <div className="mt-10 divide-y divide-border">
        {orders.map((order) => (
          <Link
            key={order.orderId}
            href={`/orders/${order.orderId}`}
            className="group flex items-center justify-between py-6"
          >
            <div>
              <p className="font-display text-base group-hover:underline">
                Order #{order.orderId.slice(0, 8)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
                {' · '}
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <span
                className={`border px-3 py-1 text-sm ${
                  order.status === 'PENDING'
                    ? 'border-error/30 text-error'
                    : 'border-border text-ink'
                }`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="w-20 text-right text-sm text-ink">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}