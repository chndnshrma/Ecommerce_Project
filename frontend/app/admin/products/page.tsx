'use client';

import { useEffect, useState } from 'react';
import type { ProductPage } from '@/lib/types';
import { apiFetch, ApiError } from '@/lib/api';

interface CreateForm {
  name: string;
  slug: string;
  description: string;
  brand: string;
  basePrice: string;
  categorySlug: string;
  variantSku: string;
  variantSize: string;
  variantColor: string;
  initialStock: string;
}

const emptyForm: CreateForm = {
  name: '', slug: '', description: '', brand: '', basePrice: '',
  categorySlug: '', variantSku: '', variantSize: '', variantColor: '', initialStock: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductPage | null>(null);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await apiFetch<ProductPage>('/products?size=50');
      setProducts(data);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Could not load products');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');

    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          brand: form.brand,
          basePrice: Number(form.basePrice),
          categorySlug: form.categorySlug,
          variantSku: form.variantSku,
          variantSize: form.variantSize || null,
          variantColor: form.variantColor || null,
          initialStock: Number(form.initialStock),
        }),
      });
      setForm(emptyForm);
      loadProducts();
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof ApiError ? err.message : 'Could not create product');
      return;
    }
    setStatus('idle');
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this product? It will be hidden from the storefront.')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Could not deactivate product');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Manage products</h1>

      <form onSubmit={handleCreate} className="mt-8 grid gap-4 border border-border p-6 sm:grid-cols-2">
        <h2 className="font-display text-lg sm:col-span-2">Add product</h2>

        {(['name', 'slug', 'brand', 'categorySlug'] as const).map((field) => (
          <div key={field}>
            <label className="text-sm capitalize text-ink">{field}</label>
            <input
              required
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="text-sm text-ink">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="mt-1 w-full resize-none border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-ink">Base price</label>
          <input
            required type="number" step="0.01"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-ink">Initial stock</label>
          <input
            required type="number"
            value={form.initialStock}
            onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-ink">Variant SKU</label>
          <input
            required
            value={form.variantSku}
            onChange={(e) => setForm({ ...form, variantSku: e.target.value })}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-ink">Size (optional)</label>
          <input
            value={form.variantSize}
            onChange={(e) => setForm({ ...form, variantSize: e.target.value })}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-ink">Color (optional)</label>
          <input
            value={form.variantColor}
            onChange={(e) => setForm({ ...form, variantColor: e.target.value })}
            className="mt-1 w-full border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        {errorMessage && <p className="text-sm text-error sm:col-span-2">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === 'saving'}
          className="mt-2 bg-accent px-5 py-2.5 text-sm text-white transition-colors hover:bg-ink disabled:opacity-40 sm:col-span-2"
        >
          {status === 'saving' ? 'Saving...' : 'Create product'}
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-display text-lg">Existing products</h2>
        <div className="mt-4 divide-y divide-border">
          {products?.content.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-4 text-sm">
              <div>
                <p className="text-ink">{p.name}</p>
                <p className="mt-0.5 text-muted">{p.slug} · ${p.basePrice.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleDeactivate(p.id)}
                className="text-error underline underline-offset-4"
              >
                Deactivate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}