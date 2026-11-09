'use client';

import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export function Toast({
    message,
    onClose,
}: {
    message: string;
    onClose: () => void;
}) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-[60] flex justify-center px-5 sm:top-8">
            <div
                role="status"
                aria-live="polite"
                className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg border border-(--color-gold)/30 bg-(--color-surface-elevated)/95 px-4 py-4 text-(--color-text) shadow-[0_16px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--color-gold)/25 bg-(--color-gold)/10">
                    <CheckCircle2
                        size={18}
                        className="text-(--color-gold-light)"
                    />
                </div>

                <p className="min-w-0 flex-1 text-xs font-medium leading-relaxed">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Dismiss notification"
                    className="shrink-0 rounded-md p-1.5 text-(--color-text-muted) transition hover:bg-white/5 hover:text-(--color-gold-light)"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}