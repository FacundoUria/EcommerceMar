export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-2xl ${className}`} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-4xl" />
      <Skeleton className="mt-3 h-3 w-1/3" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}

export function GridSkeleton({ n = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Cargando productos">
      {Array.from({ length: n }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-24" role="status" aria-label="Cargando">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="mt-3 h-4 w-2/3" />
      <div className="mt-8">
        <GridSkeleton n={4} />
      </div>
    </div>
  );
}
