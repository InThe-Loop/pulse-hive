'use client';

import type { PaymentSummary } from '../lib/payments.types';

type PaymentsSummaryProps = {
    summary: PaymentSummary;
};

type SummaryCardProps = {
    label: string;
    value: string;
    description: string;
    accent?: string;
};

function SummaryCard({
    label,
    value,
    description,
    accent = 'text-white',
}: SummaryCardProps) {
    return (
        <div className="ph-glass-panel min-w-0 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {label}
            </p>

            <p
                className={`mt-3 break-words font-mono text-2xl font-black tracking-tight ${accent}`}
            >
                {value}
            </p>

            <p className="mt-2 text-[11px] text-slate-500">
                {description}
            </p>
        </div>
    );
}

export default function PaymentsSummary({ summary }: PaymentsSummaryProps) {
    return (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
                label="Completed value"
                value={summary.completedValue}
                description="Recorded completed payments"
                accent="text-emerald-300"
            />

            <SummaryCard
                label="Pending value"
                value={summary.pendingValue}
                description="Awaiting provider confirmation"
                accent="text-amber-300"
            />

            <SummaryCard
                label="Successful transactions"
                value={summary.completedCount.toLocaleString('en-ZA')}
                description="Completed payment records"
                accent="text-white"
            />

            <SummaryCard
                label="Failed transactions"
                value={summary.failedCount.toLocaleString('en-ZA')}
                description="Failed payment records"
                accent="text-rose-300"
            />
        </section>
    );
}
