interface Props {
  className?: string;
}

export function Skeleton({ className = '' }: Props) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
      <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
      <Skeleton className="h-3 w-1/3 mx-auto" />
    </div>
  );
}

export function MatchSkeleton() {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <Skeleton className="w-full h-48" />
      <div className="p-5 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-gray-100 shadow-sm">
      <Skeleton className="w-full aspect-video" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
