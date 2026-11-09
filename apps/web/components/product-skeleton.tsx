export function ProductSkeleton() {
    return (
        <div className="group flex h-full animate-pulse flex-col overflow-hidden rounded-lg border border-(--color-border-strong) bg-(--color-surface) shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
            {/* Product Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-(--color-surface-elevated)">
                <div className="absolute inset-0 bg-linear-to-br from-white/3 via-transparent to-(--color-gold)/5" />

                <div className="absolute left-3 top-3 h-6 w-16 rounded-full border border-(--color-border) bg-white/5" />
            </div>

            {/* Product Information */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-3 flex flex-col gap-3">
                    {/* Product Name */}
                    <div className="h-5 w-3/4 rounded-sm bg-white/10" />

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="h-3 w-full rounded-sm bg-white/5" />
                        <div className="h-3 w-5/6 rounded-sm bg-white/5" />
                    </div>
                </div>

                {/* Product Size / Details */}
                <div className="mt-auto pt-4">
                    <div className="mb-4 h-px w-full bg-(--color-border)" />

                    <div className="flex items-center justify-between gap-3">
                        {/* Price */}
                        <div className="h-6 w-20 rounded-sm bg-(--color-gold)/15" />

                        {/* Add to Cart */}
                        <div className="h-10 w-10 rounded-md border border-(--color-gold)/20 bg-(--color-gold)/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}