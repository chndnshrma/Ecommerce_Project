import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import type { ProductPage } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SearchParams {
  keyword?: string;
  category?: string;
  page?: string;
}

async function getProducts(searchParams: SearchParams): Promise<ProductPage | null> {
  const params = new URLSearchParams();
  if (searchParams.keyword) params.set('keyword', searchParams.keyword);
  if (searchParams.category) params.set('category', searchParams.category);
  params.set('page', searchParams.page ?? '0');
  params.set('size', '12');

  try {
    const res = await fetch(`${API_URL}/products?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Helper to construct pagination URLs while keeping active filters
function createPageUrl(searchParams: SearchParams, pageIndex: number): string {
  const params = new URLSearchParams();
  if (searchParams.keyword) params.set('keyword', searchParams.keyword);
  if (searchParams.category) params.set('category', searchParams.category);
  params.set('page', pageIndex.toString());
  return `?${params.toString()}`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const data = await getProducts(params);

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-display text-xl">Couldn&apos;t load products</h2>
        <p className="mt-2 text-sm text-muted">
          The store is temporarily unavailable. Try refreshing the page.
        </p>
      </div>
    );
  }

  if (data.content.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-display text-xl">No products found</h2>
        <p className="mt-2 text-sm text-muted">
          {params.keyword
            ? `Nothing matched "${params.keyword}".`
            : 'Check back soon — new gear is on the way.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="font-display text-3xl">Shop all gear</h1>
      <p className="mt-2 text-sm text-muted">{data.totalElements} products</p>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {data.content.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="mt-14 flex justify-center gap-4 text-sm">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <Link
              key={i}
              href={createPageUrl(params, i)}
              className={
                i === data.number
                  ? 'text-ink underline underline-offset-4'
                  : 'text-muted hover:text-ink'
              }
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}