'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import type { Order, PaymentOrderResponse, RazorpaySuccessResponse } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api';
import { isAuthenticated, getUserId, getToken } from '@/lib/auth';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

type Stage = 'loading' | 'ready' | 'retrying' | 'error';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Payment pending',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [stage, setStage] = useState<Stage>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [razorpayReady, setRazorpayReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    setStage('loading');
    try {
      const userId = getUserId();
      const data = await apiFetch<Order>(`/orders/${userId}/${orderId}`);
      setOrder(data);
      setStage('ready');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong');
      setStage('error');
    }
  }

  async function handleRetryPayment() {
    if (!razorpayReady || !window.Razorpay) {
      setErrorMessage('Payment system is still loading. Try again in a moment.');
      return;
    }

    setStage('retrying');
    setErrorMessage('');

    try {
      const payment = await apiFetch<PaymentOrderResponse>(`/payments/${orderId}/create`, {
        method: 'POST',
      });

      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.razorpayOrderId,
        name: 'Trailhead',
        description: 'Order payment',
        handler: async (response: RazorpaySuccessResponse) => {
          await handleVerifyPayment(response);
        },
        modal: {
          ondismiss: () => setStage('ready'),
        },
        theme: { color: '#2F3B2C' },
      });

      rzp.open();
    } catch (err) {
      setStage('ready');
      setErrorMessage(err instanceof ApiError ? err.message : 'Could not start payment');
    }
  }

  async function handleVerifyPayment(response: RazorpaySuccessResponse) {
    try {
      const token = getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${orderId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
      });
      await loadOrder();
    } catch {
      setStage('error');
      setErrorMessage('Payment succeeded but confirmation failed. Contact support with your order ID.');
    }
  }

  if (stage === 'loading') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="h-9 w-56 animate-pulse bg-surface" />
        <div className="mt-8 h-40 animate-pulse bg-surface" />
      </div>
    );
  }

  if (stage === 'error' && !order) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-xl">Couldn&apos;t load this order</h2>
        <p className="mt-2 text-sm text-muted">{errorMessage}</p>
        <Link
          href="/orders"
          className="mt-6 inline-block border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-background"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const isPending = order.status === 'PENDING';

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setRazorpayReady(true)} />

      <div className="mx-auto max-w-3xl px-6 py-14">
        {order.status === 'PAID' && (
          <p className="text-sm text-accent">Order confirmed</p>
        )}
        <h1 className="mt-1 font-display text-3xl">Order #{order.orderId.slice(0, 8)}</h1>
        <p className="mt-2 text-sm text-muted">
          Placed {new Date(order.createdAt).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>

        <div className="mt-6 inline-block border border-border px-3 py-1 text-sm text-ink">
          {STATUS_LABELS[order.status] ?? order.status}
        </div>

        {isPending && (
          <div className="mt-6 border border-error/30 bg-error/5 p-5">
            <p className="text-sm text-ink">
              This order hasn&apos;t been paid yet. Complete payment to confirm it — otherwise
              it may be released back to stock.
            </p>
            {errorMessage && <p className="mt-2 text-sm text-error">{errorMessage}</p>}
            <button
              onClick={handleRetryPayment}
              disabled={stage === 'retrying'}
              className="mt-4 bg-accent px-5 py-2.5 text-sm text-white transition-colors hover:bg-ink disabled:opacity-40"
            >
              {stage === 'retrying' ? 'Processing...' : 'Complete payment'}
            </button>
          </div>
        )}

        <div className="mt-10">
          <h2 className="font-display text-lg">Items</h2>
          <div className="mt-4 divide-y divide-border">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="text-ink">{item.productName}</p>
                  <p className="mt-0.5 text-muted">
                    {[item.size, item.color].filter(Boolean).join(' / ') || item.sku} × {item.quantity}
                  </p>
                </div>
                <span className="text-ink">${item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-base">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-lg">Shipping to</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted">{order.shippingAddress}</p>
        </div>

        <Link
          href="/orders"
          className="mt-10 inline-block text-sm text-ink underline underline-offset-4"
        >
          Back to order history
        </Link>
      </div>
    </>
  );
}