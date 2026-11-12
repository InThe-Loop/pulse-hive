'use client';

import Link from 'next/link';
import { ArrowLeft, XCircle } from 'lucide-react';

export default function CheckoutErrorPage() {
    return (
        <div className="w-full bg-(--color-background) pb-4">
            <main className="mx-auto w-full max-w-360 px-5 pt-6 sm:px-6 sm:pt-8">
                <div className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-9 text-center sm:px-10 sm:py-10">
                    <div className="absolute inset-x-0 top-0 h-px gold-foil" />
                    <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />
                    <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

                    <div className="relative z-10">
                        <div className="mb-5 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-400/30 bg-red-400/10 text-red-300">
                                <XCircle size={30} strokeWidth={1.5} />
                            </div>
                        </div>

                        <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-red-300">
                            Checkout / Payment status
                        </span>

                        <h1 className="mt-3 font-serif text-2xl leading-tight text-red-200 sm:text-3xl">
                            Payment Unsuccessful
                        </h1>

                        <p className="mx-auto mt-3 max-w-sm font-body text-xs leading-6 text-red-100/70 sm:text-sm">
                            We were unable to complete your payment. Please return to the store if you would like to try again.
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <p className="font-body text-xs leading-6 text-(--color-text-muted)">
                        If you believe your payment was processed, please allow time for confirmation before attempting another payment.
                    </p>

                    <div className="mt-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wider text-red-300 transition-colors hover:text-red-200"
                        >
                            <ArrowLeft size={15} />
                            Return to Home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
