'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
    return (
        <div className="w-full min-h-screen bg-(--color-background) pb-16">
            <main className="px-6 pt-12 flex justify-center">
                <div className="w-full border border-(--color-border-strong) p-10 text-center shadow-xs">

                    {/* Icon */}
                    <div className="flex justify-center mb-5">
                        <div className="w-16 h-16 bg-(--color-surface) flex items-center justify-center text-(--color-gold-dark) rounded-full border border-(--color-border)">
                            <CheckCircle2 size={32} />
                        </div>
                    </div>

                    {/* Content */}
                    <h1 className="text-2xl font-serif text-(--color-text) mb-2">
                        Payment Successful
                    </h1>

                    <p className="text-sm text-(--color-text-muted)">
                        Thank you for your order. Your payment
                        has been successfully processed.
                    </p>

                    {/* Explicit spacing */}
                    <div className="h-16" />
                    
                    {/* Button Section */}
                    <div className="mt-12 pt-8 border-t border-(--color-border)">
                        <Link
                            href="/"
                            className="w-full h-12 inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:brightness-105"
                        >
                            Continue Shopping
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}