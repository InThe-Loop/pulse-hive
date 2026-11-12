'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
    return (
        <div className="w-full bg-(--color-background) pb-4">
            <main className="mx-auto w-full max-w-360 px-5 pt-6 sm:px-6 sm:pt-8">
                <div className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-9 text-center sm:px-10 sm:py-10">
                    <div className="absolute inset-x-0 top-0 h-px gold-foil" />
                    <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />
                    <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

                    <div className="relative z-10">
                        <div className="mb-5 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                                <CheckCircle2 size={30} strokeWidth={1.5} />
                            </div>
                        </div>

                        <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                            Checkout / Order confirmation
                        </span>

                        <h1 className="mt-3 font-serif text-2xl leading-tight text-emerald-200 sm:text-3xl">
                            Payment Successful
                        </h1>

                        <p className="mx-auto mt-3 max-w-sm font-body text-xs leading-6 text-emerald-100/70 sm:text-sm">
                            Thank you for your order. Your payment has been successfully processed. We appreciate you choosing Glowa Vee.
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <p className="font-body text-xs leading-6 text-(--color-text-muted)">
                        Your order is now being prepared. Thank you for shopping with Glowa Vee.
                    </p>

                    <div className="mt-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wider text-emerald-300 transition-colors hover:text-emerald-200"
                        >
                            Continue Shopping
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
