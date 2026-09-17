export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="h-9 w-56 animate-pulse bg-surface" />
      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse bg-surface" />
        ))}
      </div>
    </div>
  );
}