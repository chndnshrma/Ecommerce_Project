import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 text-center">
      <h2 className="text-lg font-medium">Product not found</h2>
      <p className="mt-2 text-sm text-stone-500">
        This item may have been removed or the link is incorrect.
      </p>
      <Link href="/products" className="mt-4 inline-block text-sm underline">
        Back to shop
      </Link>
    </div>
  );
}