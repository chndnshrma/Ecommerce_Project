'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Cart } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api';
import { isAuthenticated, getUserId } from '@/lib/auth';
import CartItemRow from '@/components/CartItemRow';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadCart();
  }, []);

  async function loadCart() {
    setStatus('loading');
    try {
      const userId = getUserId();
      const data = await apiFetch<Cart>(`/cart/${userId}`);
      setCart(data);
      setStatus('ready');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  async function handleUpdateQuantity(cartItemId: string, quantity: number) {
    setUpdatingItemId(cartItemId);
    try {
      const userId = getUserId();
      const data = await apiFetch<Cart>(`/cart/${userId}/items/${cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      setCart(data);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Could not update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleRemove(cartItemId: string) {
    setUpdatingItemId(cartItemId);
    try {
      const userId = getUserId();
      const data = await apiFetch<Cart>(`/cart/${userId}/items/${cartItemId}`, {
        method: 'DELETE',
      });
      setCart(data);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Could not remove item');
    } finally {
      setUpdatingItemId(null);
    }
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="h-9 w-40 animate-pulse bg-surface" />
        <div className="mt-10 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-xl">Couldn&apos;t load your cart</h2>
        <p className="mt-2 text-sm text-muted">{errorMessage}</p>
        <button
          onClick={loadCart}
          className="mt-6 border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-background"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-xl">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted">Find something to add to it.</p>
        <Link
          href="/products"
          className="mt-6 inline-block border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-background"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const hasStockIssue = cart.items.some((item) => item.quantity > item.stockAvailable);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-display text-3xl">Your cart</h1>

      <div className="mt-10">
        {cart.items.map((item) => (
          <CartItemRow
            key={item.cartItemId}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
            isUpdating={updatingItemId === item.cartItemId}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <span className="font-display text-lg">Total</span>
        <span className="font-display text-lg">${cart.totalAmount.toFixed(2)}</span>
      </div>

      {hasStockIssue && (
        <p className="mt-4 text-sm text-error">
          Some items exceed available stock. Adjust quantities before checking out.
        </p>
      )}

      <Link
        href="/checkout"
        aria-disabled={hasStockIssue}
        onClick={(e) => hasStockIssue && e.preventDefault()}
        className={`mt-6 block w-full py-3.5 text-center text-sm text-white transition-colors ${
          hasStockIssue ? 'cursor-not-allowed bg-muted' : 'bg-accent hover:bg-ink'
        }`}
      >
        Proceed to checkout
      </Link>
    </div>
  );
}