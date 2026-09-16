import { notFound } from 'next/navigation';
import type { Product } from '@/lib/types';
import ProductDetailClient from './ProductDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 60 },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch product');

    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: 'Product not found' };

  return {
    title: `${product.name} — Trailhead`,
    description: product.description,
  };
}