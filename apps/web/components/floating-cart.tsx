'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';

export function FloatingCart() {
    const { cart } = useCart();
    const itemCount = cart.reduce(
        (total: number, item: { quantity?: number }) =>
            total + (Number(item.quantity) || 1),
        0,
    );

    return (
        <Link
            href="/cart"
            aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            className="group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-(--color-border-strong) bg-white/[0.025] px-3.5 text-(--color-text) transition duration-200 hover:border-(--color-gold) hover:bg-[rgba(216,181,109,0.055)] hover:shadow-[0_0_26px_rgba(216,181,109,0.1)] sm:h-11 sm:px-4"
        >
            <span className="relative inline-flex">
                <ShoppingBag
                    size={18}
                    strokeWidth={1.6}
                    className="transition-colors group-hover:text-(--color-gold-light)"
                />
                <span
                    className={`absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[9px] font-extrabold leading-none ${
                        itemCount > 0
                            ? 'gold-foil text-[#120d05] shadow-[0_2px_8px_rgba(216,181,109,0.2)]'
                            : 'border border-(--color-border-strong) bg-[#14120e] text-(--color-gold-light)'
                    }`}
                >
                    {itemCount}
                </span>
            </span>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.19em] sm:inline">
                Bag
            </span>
        </Link>
    );
}