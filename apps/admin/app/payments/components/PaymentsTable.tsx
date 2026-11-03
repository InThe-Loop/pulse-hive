'use client';

import type { PaymentRecord } from '../lib/payments.types';
import {
    amountValue,
    formatDate,
    money,
    paymentActivityDate,
    paymentReference,
    providerLabel,
    statusClasses,
    statusLabel,
} from '../lib/payments.utils';

type PaymentsTableProps = {
    payments: PaymentRecord[];
    filteredPayments: PaymentRecord[];
    loading: boolean;
    hasActiveFilters: boolean;
    onSelectPayment: (payment: PaymentRecord) => void;
    onResetFilters: () => void;
};

function PaymentStatusPill({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClasses(status)}`}
        >
            {statusLabel(status)}
        </span>
    );
}

function PaymentsTableSkeleton() {
    return (
        <>
            {Array.from({ length: 4 }).map((_, index) => (
                <tr key={index}>
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="px-5 py-5">
                            <div className="h-3 animate-pulse rounded bg-white/[0.06]" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export default function PaymentsTable({
    payments,
    filteredPayments,
    loading,
    hasActiveFilters,
    onSelectPayment,
    onResetFilters,
}: PaymentsTableProps) {
    return (
        <section className="ph-glass-panel overflow-hidden">
            <div className="flex flex-col justify-between gap-2 border-b border-white/6 px-5 py-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-sm font-bold text-white">
                        Payment ledger
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Select a transaction reference to inspect its details.
                    </p>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {filteredPayments.length} results
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="ph-ledger-table w-full min-w-[1050px] text-left">
                    <thead className="border-b border-white/6 bg-white/[0.02]">
                        <tr>
                            <th className="ph-ledger-th">Date</th>
                            <th className="ph-ledger-th">Customer</th>
                            <th className="ph-ledger-th">Order</th>
                            <th className="ph-ledger-th">Provider</th>
                            <th className="ph-ledger-th">Transaction reference</th>
                            <th className="ph-ledger-th text-right">Amount</th>
                            <th className="ph-ledger-th">Status</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/4">
                        {loading && payments.length === 0 ? (
                            <PaymentsTableSkeleton />
                        ) : filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-16 text-center">
                                    <p className="text-sm font-semibold text-slate-300">
                                        {payments.length === 0
                                            ? 'No payment records found'
                                            : 'No payments match these filters'}
                                    </p>

                                    <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-500">
                                        {payments.length === 0
                                            ? 'Payment transactions will appear here when your payment provider records them.'
                                            : 'Try changing your search criteria or clearing the filters.'}
                                    </p>

                                    {payments.length > 0 && hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={onResetFilters}
                                            className="mt-3 text-xs font-bold text-indigo-300 hover:text-indigo-200"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="transition-colors hover:bg-white/[0.02]"
                                >
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <p className="text-xs font-semibold text-slate-300">
                                            {formatDate(paymentActivityDate(payment))}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-600">
                                            {payment.status === 'COMPLETED'
                                                ? 'Completed'
                                                : 'Initiated'}
                                        </p>
                                    </td>

                                    <td className="max-w-[190px] px-5 py-4">
                                        <p className="truncate text-xs font-semibold text-white">
                                            {payment.customerName || 'Guest customer'}
                                        </p>

                                        <p className="mt-1 truncate text-[10px] text-slate-500">
                                            {payment.customerEmail ||
                                                payment.customerPhone ||
                                                'No contact details'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        {payment.order ? (
                                            <span className="font-mono text-xs font-semibold text-indigo-300">
                                                {payment.order.reference}
                                            </span>
                                        ) : (
                                            <span className="rounded-md border border-amber-400/15 bg-amber-400/[0.05] px-2 py-1 text-[10px] font-semibold text-amber-300">
                                                Unlinked
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="text-xs font-semibold text-slate-300">
                                            {providerLabel(payment.provider)}
                                        </span>
                                    </td>

                                    <td className="max-w-[220px] px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onSelectPayment(payment)}
                                            className="block max-w-full truncate font-mono text-[11px] text-indigo-300 transition hover:text-indigo-200 hover:underline hover:underline-offset-4"
                                        >
                                            {paymentReference(payment)}
                                        </button>

                                        <p className="mt-1 text-[10px] text-slate-600">
                                            View transaction
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-xs font-bold text-white">
                                        {money(
                                            amountValue(payment.amount),
                                            payment.currency || 'ZAR',
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <PaymentStatusPill status={payment.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-white/6 px-5 py-3 sm:flex-row sm:items-center">
                <p className="text-[10px] leading-5 text-slate-600">
                    Showing the latest 100 payment records returned by the
                    payment service. Filters apply to this result set.
                </p>

                <p className="shrink-0 font-mono text-[10px] text-slate-500">
                    {filteredPayments.length} displayed
                </p>
            </div>
        </section>
    );
}
