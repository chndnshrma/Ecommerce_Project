'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, Variant } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api';
import { isAuthenticated, getUserId } from '@/lib/auth';

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const price = selectedVariant?.effectivePrice ?? product.basePrice;
  const inStock = (selectedVariant?.stockAvailable ?? 0) > 0;

  async function handleAddToCart() {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!selectedVariant) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const userId = getUserId();
      await apiFetch(`/cart/${userId}/items`, {
        method: 'POST',
        body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-stone-100">
          {selectedVariant?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedVariant.imageUrl}
              alt={product.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">
              No image
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-3 text-xl font-semibold">${price.toFixed(2)}</p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.description}</p>

          {product.variants.length > 1 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-stone-900">Options</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stockAvailable === 0}
                    className={`rounded border px-3 py-1.5 text-sm ${
                      selectedVariant?.id === variant.id
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-300 text-stone-700 hover:border-stone-500'
                    } ${variant.stockAvailable === 0 ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    {[variant.size, variant.color].filter(Boolean).join(' / ') || variant.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <label htmlFor="quantity" className="text-sm font-medium">
              Quantity
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded border border-stone-300 px-2 py-1 text-sm"
            >
              {Array.from({ length: Math.min(10, selectedVariant?.stockAvailable ?? 1) }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {!inStock && (
            <p className="mt-4 text-sm font-medium text-red-600">
              This option is currently out of stock.
            </p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!inStock || status === 'loading'}
            className="mt-6 w-full rounded bg-stone-900 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === 'loading' ? 'Adding...' : 'Add to cart'}
          </button>

          {status === 'success' && (
            <p className="mt-3 text-sm text-green-700">Added to your cart.</p>
          )}
          {status === 'error' && (
            <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}