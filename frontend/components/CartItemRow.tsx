'use client';

import type { CartItem } from '@/lib/types';

interface Props {
  item: CartItem;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
  isUpdating: boolean;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove, isUpdating }: Props) {
  return (
    <div className="flex items-center gap-6 border-b border-border py-6">
      <div className="h-24 w-24 shrink-0 bg-surface" />

      <div className="flex-1">
        <p className="font-display text-base">{item.productName}</p>
        <p className="mt-1 text-sm text-muted">
          {[item.size, item.color].filter(Boolean).join(' / ') || item.sku}
        </p>
        <p className="mt-1 text-sm text-ink">${item.unitPrice.toFixed(2)}</p>

        {item.quantity > item.stockAvailable && (
          <p className="mt-2 text-sm text-error">
            Only {item.stockAvailable} left in stock — reduce quantity to continue.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <select
          value={item.quantity}
          disabled={isUpdating}
          onChange={(e) => onUpdateQuantity(item.cartItemId, Number(e.target.value))}
          className="border border-border bg-transparent px-2 py-1.5 text-sm disabled:opacity-40"
        >
          {Array.from({ length: Math.max(item.quantity, item.stockAvailable, 1) }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        <button
          onClick={() => onRemove(item.cartItemId)}
          disabled={isUpdating}
          className="text-sm text-muted underline underline-offset-4 hover:text-error disabled:opacity-40"
        >
          Remove
        </button>
      </div>

      <p className="w-20 text-right text-sm text-ink">${item.lineTotal.toFixed(2)}</p>
    </div>
  );
}