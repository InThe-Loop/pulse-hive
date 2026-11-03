import type { ReconciliationRecord } from '../lib/reconciliation.types';

interface ReconciliationSummaryProps {
    records: ReconciliationRecord[];
}

function SummaryCard({
    label,
    value,
    description,
    accent,
}: {
    label: string;
    value: string;
    description: string;
    accent: string;
}) {
    return (
        <div className="ph-glass-panel min-w-0 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {label}
            </p>

            <p
                className={`mt-3 font-mono text-2xl font-black tracking-tight ${accent}`}
            >
                {value}
            </p>

            <p className="mt-2 text-[11px] text-slate-500">
                {description}
            </p>
        </div>
    );
}

export default function ReconciliationSummary({
    records,
}: ReconciliationSummaryProps) {
    const matched = records.filter(
        (record) => record.status === 'MATCHED',
    ).length;

    const partial = records.filter(
        (record) => record.status === 'PARTIAL',
    ).length;

    const pending = records.filter(
        (record) => record.status === 'PENDING',
    ).length;

    const review = records.filter(
        (record) => record.status === 'REVIEW',
    ).length;

    return (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
                label="Matched"
                value={matched.toLocaleString('en-ZA')}
                description="Completed gateway value equals order total"
                accent="text-emerald-300"
            />

            <SummaryCard
                label="Partially paid"
                value={partial.toLocaleString('en-ZA')}
                description="Some payment value is recorded"
                accent="text-amber-300"
            />

            <SummaryCard
                label="Awaiting payment"
                value={pending.toLocaleString('en-ZA')}
                description="No completed payment recorded"
                accent="text-slate-200"
            />

            <SummaryCard
                label="Needs review"
                value={review.toLocaleString('en-ZA')}
                description="Exceptions requiring investigation"
                accent="text-rose-300"
            />
        </section>
    );
}