
'use client';

import { useCart } from '@/context/cart-context';
import { ShoppingBag } from 'lucide-react';

type ProductCardData = {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
    size?: string | null;
    price: number;
};

export function ProductCard({
    product,
}: {
    product: ProductCardData;
}) {
    const { addToCart } = useCart();

    return (
        <article className="group relative flex h-full flex-col overflow-hidden border border-(--color-border) bg-[linear-gradient(155deg,#191713_0%,#12110f_48%,#0d0d0c_100%)] transition-all duration-300 hover:-translate-y-1 hover:border-(--color-border-strong) hover:shadow-[0_24px_58px_rgba(0,0,0,0.48),0_0_24px_rgba(216,181,109,0.055)]">

            {/* Top gold accent */}
            <div className="absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 gold-foil opacity-80 transition-transform duration-500 group-hover:scale-x-100" />

            {/* Product image */}
            <div className="product-media relative aspect-4/5 w-full overflow-hidden">
                <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.025)_0%,transparent_26%,transparent_72%,rgba(0,0,0,0.2)_100%)]" />

                <div className="pointer-events-none absolute inset-x-8 bottom-5 z-0 h-8 rounded-full bg-black/65 blur-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-black/80" />

                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="relative z-1 h-full w-full object-contain p-5 drop-shadow-[0_16px_22px_rgba(0,0,0,0.24)] transition-transform duration-700 ease-out group-hover:scale-[1.055] sm:p-7"
                    />
                ) : (
                    <div className="relative z-1 flex h-full w-full items-center justify-center">
                        <span className="font-display text-2xl font-medium tracking-[0.2em] text-(--color-gold)/70">
                            GV
                        </span>
                    </div>
                )}
            </div>

            {/* Product content */}
            <div className="flex flex-1 flex-col border-t border-white/5.5 px-3.5 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
                <div className="flex-1">
                    <h2 className="font-body text-sm font-semibold leading-snug tracking-[-0.015em] text-(--color-text) transition-colors group-hover:text-(--color-gold-light) sm:text-[15px]">
                        {product.name}
                    </h2>

                    {product.description && (
                        <p className="mt-2 line-clamp-3 font-body text-[11px] leading-[1.75] text-(--color-text-muted) sm:text-xs">
                            {product.description}
                        </p>
                    )}
                </div>

                {/* Price, size and add to bag */}
                <div className="mt-5 flex flex-col gap-3 border-t border-(--color-border) pt-4 sm:flex-row sm:items-center">
                    {/* Price and product size */}
                    <div className="flex w-full min-w-0 items-center justify-center gap-2 sm:flex-[2] sm:justify-start">
                        <span className="shrink-0 whitespace-nowrap gold-foil-text font-body text-base font-bold tracking-tight sm:text-lg">
                            R{product.price}
                        </span>

                        {product.size?.trim() && (
                            <span className="min-w-0 break-words border-l border-(--color-border-strong) pl-2 font-body text-[10px] font-medium leading-relaxed tracking-wide text-(--color-text-muted)">
                                {product.size.trim()}
                            </span>
                        )}
                    </div>

                    {/* Add to bag */}
                    <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="button-gold min-h-10 w-full cursor-pointer px-3.5 py-2 font-body text-[9px] sm:min-w-0 sm:flex-[3] sm:px-2"
                        aria-label={`Add ${product.name} to bag`}
                    >
                        <ShoppingBag
                            size={13}
                            strokeWidth={1.8}
                        />
                        Add to bag
                    </button>
                </div>
            </div>

            {/* Bottom gold accent */}
            <div className="h-0.5 w-0 bg-linear-to-r from-(--color-gold-dark) via-(--color-gold-light) to-(--color-gold-dark) transition-all duration-500 group-hover:w-full" />
        </article>
    );
}
