export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-lg bg-stone-200" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
          <div className="h-8 w-64 animate-pulse rounded bg-stone-200" />
          <div className="h-6 w-20 animate-pulse rounded bg-stone-200" />
          <div className="h-24 animate-pulse rounded bg-stone-200" />
        </div>
      </div>
    </div>
  );
}