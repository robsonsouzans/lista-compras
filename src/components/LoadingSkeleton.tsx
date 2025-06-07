
import { Skeleton } from "@/components/ui/skeleton";

export const ShoppingListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-card rounded-lg border animate-fade-in">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-[60px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
          <Skeleton className="h-8 w-[80px]" />
        </div>
      ))}
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card p-4 rounded-lg border">
          <Skeleton className="h-4 w-[60px] mb-2" />
          <Skeleton className="h-8 w-[80px]" />
        </div>
      ))}
    </div>
  );
};
