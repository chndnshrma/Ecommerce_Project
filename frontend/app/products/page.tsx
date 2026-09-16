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
      next: { revalidate: 60 }, // ISR: re-fetch at most once per minute
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
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
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-lg font-medium">Couldn't load products</h2>
        <p className="mt-2 text-sm text-stone-500">
          The store is temporarily unavailable. Try refreshing the page.
        </p>
      </div>
    );
  }

  if (data.content.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-lg font-medium">No products found</h2>
        <p className="mt-2 text-sm text-stone-500">
          {params.keyword
            ? `Nothing matched "${params.keyword}".`
            : 'Check back soon — new gear is on the way.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Shop all gear</h1>
      <p className="mt-1 text-sm text-stone-500">{data.totalElements} products</p>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {data.content.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2 text-sm">
          {Array.from({ length: data.totalPages }, (_, i) => (
            
              key={i}
              href={`?page=${i}`}
              className={`rounded px-3 py-1 ${
                i === data.number ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}