export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid gap-14 md:grid-cols-2">
        <div className="aspect-square animate-pulse bg-surface" />
        <div className="space-y-5">
          <div className="h-4 w-24 animate-pulse bg-surface" />
          <div className="h-9 w-64 animate-pulse bg-surface" />
          <div className="h-6 w-20 animate-pulse bg-surface" />
          <div className="h-24 animate-pulse bg-surface" />
        </div>
      </div>
    </div>
  );
}