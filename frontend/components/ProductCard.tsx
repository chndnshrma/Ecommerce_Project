import Link from 'next/link';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const firstVariant = product.variants[0];
  const price = firstVariant?.effectivePrice ?? product.basePrice;
  const inStock = product.variants.some((v) => v.stockAvailable > 0);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-square bg-stone-100">
        {firstVariant?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstVariant.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-stone-500">{product.brand}</p>
        <h3 className="mt-1 font-medium text-stone-900">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold">${price.toFixed(2)}</span>
          {!inStock && (
            <span className="text-xs font-medium text-red-600">Out of stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}