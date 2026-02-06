interface LoadingSkeletonProps {
    className?: string;
}

/** Base skeleton pulse animation */
export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm p-6 border border-slate-200 dark:border-slate-700 rounded-2xl w-full h-[200px] animate-pulse">
            <div className="bg-slate-200 dark:bg-slate-700 mb-4 rounded-xl w-3/4 h-8" />
            <div className="bg-slate-200 dark:bg-slate-700 mb-2 rounded-xl w-1/2 h-6" />
            <div className="bg-slate-200 dark:bg-slate-700 rounded-xl w-full h-24" />
        </div>
    );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <LoadingSkeleton key={i} className="w-full h-16" />
            ))}
        </div>
    );
}
