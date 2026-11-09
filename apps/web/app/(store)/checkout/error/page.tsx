'use client';

import Link from 'next/link';
import { ArrowLeft, XCircle } from 'lucide-react';

export default function CheckoutErrorPage() {
    return (
        <div className="w-full min-h-screen bg-(--color-background) pb-16">
            <main className="px-6 pt-12 flex justify-center">
                <div className="w-full border border-red-200 p-10 text-center shadow-xs">

                    {/* Icon */}
                    <div className="flex justify-center mb-5">
                        <div className="w-16 h-16 bg-red-50 flex items-center justify-center text-red-600 rounded-full border border-red-200">
                            <XCircle size={32} />
                        </div>
                    </div>

                    {/* Content */}
                    <h1 className="text-2xl font-serif text-(--color-text) mb-2">
                        Payment Unsuccessful
                    </h1>

                    <p className="text-sm text-(--color-text-muted)">
                        We were unable to complete your payment.
                        Please try again.
                    </p>

                    {/* Explicit spacing */}
                    <div className="h-16" />

                    {/* Button Section */}
                    <div className="mt-12 pt-8 border-t border-(--color-border)">
                        <Link
                            href="/checkout"
                            className="w-full h-12 inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:brightness-105"
                        >
                            <ArrowLeft size={14} />
                            Try Again
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}