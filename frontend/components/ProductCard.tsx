import Link from 'next/link';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const firstVariant = product.variants[0];
  const price = firstVariant?.effectivePrice ?? product.basePrice;
  const inStock = product.variants.some((v) => v.stockAvailable > 0);

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-surface">
        {firstVariant?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstVariant.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No image
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs tracking-wide text-muted">{product.brand}</p>
        <h3 className="mt-0.5 font-display text-base">{product.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-ink">${price.toFixed(2)}</span>
          {!inStock && <span className="text-xs text-error">Out of stock</span>}
        </div>
      </div>
    </Link>
  );
}