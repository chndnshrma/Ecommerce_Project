'use client';

import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Payment pending', PAID: 'Paid', SHIPPED: 'Shipped',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled', RETURNED: 'Returned',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    apiFetch<Order[]>('/admin/orders')
      .then(setOrders)
      .catch((err) => setErrorMessage(err instanceof ApiError ? err.message : 'Could not load orders'));
  }, []);

  if (errorMessage) return <p className="text-sm text-error">{errorMessage}</p>;

  return (
    <div>
      <h1 className="font-display text-2xl">All orders</h1>
      <div className="mt-8 divide-y divide-border">
        {orders.map((order) => (
          <div key={order.orderId} className="flex items-center justify-between py-4 text-sm">
            <div>
              <p className="text-ink">#{order.orderId.slice(0, 8)}</p>
              <p className="mt-0.5 text-muted">
                {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="border border-border px-3 py-1">{STATUS_LABELS[order.status] ?? order.status}</span>
              <span className="w-20 text-right text-ink">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}