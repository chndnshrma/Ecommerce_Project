'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import type { Cart, PaymentOrderResponse, RazorpaySuccessResponse } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api';
import { isAuthenticated, getUserId, getToken } from '@/lib/auth';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

type Stage = 'loading' | 'ready' | 'placing' | 'error';

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [stage, setStage] = useState<Stage>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [razorpayReady, setRazorpayReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const userId = getUserId();
      const data = await apiFetch<Cart>(`/cart/${userId}`);

      if (data.items.length === 0) {
        router.push('/cart');
        return;
      }

      setCart(data);
      setStage('ready');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong');
      setStage('error');
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingAddress.trim()) return;

    setStage('placing');
    setErrorMessage('');

    try {
      const userId = getUserId();

      // Step 1 — place the order (backend deducts/reserves stock here)
      const order = await apiFetch<{ orderId: string }>(`/orders/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ shippingAddress }),
      });

      // Step 2 — create a Razorpay payment order tied to it
      const payment = await apiFetch<PaymentOrderResponse>(
        `/payments/${order.orderId}/create`,
        { method: 'POST' }
      );

      openRazorpayCheckout(order.orderId, payment);
    } catch (err) {
      setStage('ready');
      setErrorMessage(err instanceof ApiError ? err.message : 'Could not place order');
    }
  }

  function openRazorpayCheckout(orderId: string, payment: PaymentOrderResponse) {
    if (!razorpayReady || !window.Razorpay) {
      setErrorMessage('Payment system is still loading. Try again in a moment.');
      setStage('ready');
      return;
    }

    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: payment.amount,
      currency: payment.currency,
      order_id: payment.razorpayOrderId,
      name: 'Trailhead',
      description: 'Order payment',
      handler: async (response: RazorpaySuccessResponse) => {
        await handleVerifyPayment(orderId, response);
      },
      modal: {
        ondismiss: () => {
          setStage('ready');
          setErrorMessage('Payment was cancelled. Your order is saved as pending — you can retry from Order History.');
        },
      },
      theme: { color: '#2F3B2C' },
    });

    rzp.open();
  }

  async function handleVerifyPayment(orderId: string, response: RazorpaySuccessResponse) {
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

      router.push(`/orders/${orderId}`);
    } catch {
      setStage('error');
      setErrorMessage('Payment succeeded but confirmation failed. Contact support with your order ID.');
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayReady(true)}
      />

      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="font-display text-3xl">Checkout</h1>

        {stage === 'loading' && (
          <div className="mt-10 space-y-4">
            <div className="h-20 animate-pulse bg-surface" />
            <div className="h-20 animate-pulse bg-surface" />
          </div>
        )}

        {stage === 'error' && !cart && (
          <div className="mt-10 text-center">
            <p className="text-sm text-error">{errorMessage}</p>
            <button
              onClick={loadCart}
              className="mt-4 border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-background"
            >
              Try again
            </button>
          </div>
        )}

        {cart && (
          <div className="mt-10 grid gap-14 md:grid-cols-2">
            <form onSubmit={handlePlaceOrder}>
              <label htmlFor="address" className="text-sm text-ink">
                Shipping address
              </label>
              <textarea
                id="address"
                required
                rows={4}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Street, city, state, postal code, country"
                className="mt-2 w-full resize-none border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
              />

              {errorMessage && stage !== 'error' && (
                <p className="mt-3 text-sm text-error">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={stage === 'placing'}
                className="mt-6 w-full bg-accent py-3.5 text-sm text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {stage === 'placing' ? 'Processing...' : `Pay $${cart.totalAmount.toFixed(2)}`}
              </button>
            </form>

            <div>
              <h2 className="font-display text-lg">Order summary</h2>
              <div className="mt-4 divide-y divide-border">
                {cart.items.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between py-3 text-sm">
                    <span className="text-ink">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-muted">${item.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-base">
                <span>Total</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}