'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 text-center">
      <h2 className="text-lg font-medium">Something went wrong</h2>
      <p className="mt-2 text-sm text-stone-500">The product list couldn't be loaded.</p>
      <button
        onClick={reset}
        className="mt-4 rounded bg-stone-900 px-4 py-2 text-sm text-white"
      >
        Try again
      </button>
    </div>
  );
}