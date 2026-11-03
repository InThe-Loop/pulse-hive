import type { ReconciliationRecord } from '../lib/reconciliation.types';

import {
    formatReconciliationAmount,
    reconciliationStatusClasses,
    reconciliationStatusLabel,
} from '../lib/reconciliation.utils';

import {
    formatDate,
    money,
    statusLabel,
} from '../../orders/lib/orders.utils';

interface ReconciliationLedgerProps {
    records: ReconciliationRecord[];
    loading: boolean;
    hasLoadedRecords: boolean;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

function StatusPill({
    record,
}: {
    record: ReconciliationRecord;
}) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${reconciliationStatusClasses(record.status)}`}
        >
            {reconciliationStatusLabel(record.status)}
        </span>
    );
}

function PaymentTransactions({
    record,
}: {
    record: ReconciliationRecord;
}) {
    const payments = record.order.payments;

    if (payments.length === 0) {
        return (
            <span className="text-[11px] text-slate-600">
                No gateway transactions
            </span>
        );
    }

    return (
        <details className="max-w-xs">
            <summary className="cursor-pointer text-xs font-semibold text-indigo-300 transition hover:text-indigo-200">
                View {payments.length} transaction
                {payments.length === 1 ? '' : 's'}
            </summary>

            <div className="mt-3 min-w-[260px] space-y-2 rounded-lg border border-white/8 bg-slate-950/80 p-3">
                {payments.map((payment) => {
                    const reference =
                        payment.providerReference ||
                        payment.transactionReference ||
                        payment.paymentRequestId ||
                        payment.id;

                    const currency = payment.currency || 'ZAR';

                    return (
                        <div
                            key={payment.id}
                            className="border-b border-white/5 pb-2 last:border-0 last:pb-0"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-slate-200">
                                        {payment.provider || 'Unknown provider'}
                                    </p>

                                    <p
                                        className="mt-1 truncate font-mono text-[10px] text-slate-500"
                                        title={reference}
                                    >
                                        {reference}
                                    </p>
                                </div>

                                <p className="shrink-0 text-[11px] font-semibold text-white">
                                    {formatReconciliationAmount(
                                        payment.amount,
                                        currency,
                                    )}
                                </p>
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-3">
                                <span className="text-[10px] text-slate-500">
                                    {statusLabel(payment.status)}
                                </span>

                                <span className="text-[10px] text-slate-600">
                                    {formatDate(
                                        payment.completedAt ||
                                        payment.createdAt,
                                    )}
                                </span>
                            </div>

                            {payment.providerStatusMessage && (
                                <p className="mt-2 break-words text-[10px] leading-4 text-slate-500">
                                    {payment.providerStatusMessage}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </details>
    );
}

export default function ReconciliationLedger({
    records,
    loading,
    hasLoadedRecords,
    hasActiveFilters,
    onResetFilters,
}: ReconciliationLedgerProps) {
    return (
        <section className="ph-glass-panel overflow-hidden">
            <div className="flex flex-col justify-between gap-2 border-b border-white/6 px-5 py-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-sm font-bold text-white">
                        Order payment ledger
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Compare each order total with its recorded completed gateway payments.
                    </p>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {records.length} results
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="ph-ledger-table w-full min-w-[1120px] text-left">
                    <thead className="border-b border-white/6 bg-white/[0.02]">
                        <tr>
                            <th className="ph-ledger-th">Order</th>
                            <th className="ph-ledger-th">Customer</th>
                            <th className="ph-ledger-th text-right">
                                Order total
                            </th>
                            <th className="ph-ledger-th text-right">
                                Gateway received
                            </th>
                            <th className="ph-ledger-th text-right">
                                Difference
                            </th>
                            <th className="ph-ledger-th">Transactions</th>
                            <th className="ph-ledger-th">Result</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/4">
                        {loading && !hasLoadedRecords ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <tr key={index}>
                                    {Array.from({ length: 7 }).map(
                                        (_, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className="px-5 py-5"
                                            >
                                                <div className="h-3 animate-pulse rounded bg-white/[0.06]" />
                                            </td>
                                        ),
                                    )}
                                </tr>
                            ))
                        ) : records.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-5 py-16 text-center"
                                >
                                    <p className="text-sm font-semibold text-slate-300">
                                        {hasLoadedRecords
                                            ? 'No records match these filters'
                                            : 'No orders found'}
                                    </p>

                                    <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-500">
                                        {hasLoadedRecords
                                            ? 'Try changing your search criteria or clearing the filters.'
                                            : 'Orders will appear here when they are available in this workspace.'}
                                    </p>

                                    {hasLoadedRecords && hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={onResetFilters}
                                            className="mt-3 text-xs font-bold text-indigo-300 transition hover:text-indigo-200"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            records.map((record) => (
                                <tr
                                    key={record.order.id}
                                    className="align-top transition-colors hover:bg-white/[0.02]"
                                >
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <p className="font-mono text-xs font-bold text-indigo-300">
                                            {record.order.reference}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-500">
                                            {formatDate(record.order.createdAt)}
                                        </p>
                                    </td>

                                    <td className="max-w-[190px] px-5 py-4">
                                        <p className="truncate text-xs font-semibold text-white">
                                            {record.order.customerName}
                                        </p>

                                        <p className="mt-1 truncate text-[10px] text-slate-500">
                                            {record.order.email ||
                                                record.order.contactNumber ||
                                                'No contact details'}
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-xs font-semibold text-slate-200">
                                        {money(record.order.totalAmount)}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                        <p className="font-mono text-xs font-semibold text-emerald-300">
                                            {money(record.completedAmount)}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-600">
                                            {record.completedPaymentCount}{' '}
                                            completed
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                        {record.balance > 0.01 ? (
                                            <span className="font-mono text-xs font-semibold text-amber-300">
                                                {money(record.balance)} due
                                            </span>
                                        ) : record.balance < -0.01 ? (
                                            <span className="font-mono text-xs font-semibold text-rose-300">
                                                {money(Math.abs(record.balance))} over
                                            </span>
                                        ) : (
                                            <span className="font-mono text-xs font-semibold text-emerald-300">
                                                R 0.00
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <PaymentTransactions record={record} />
                                    </td>

                                    <td className="min-w-[190px] px-5 py-4">
                                        <StatusPill record={record} />

                                        <p
                                            className="mt-2 max-w-[220px] text-[10px] leading-4 text-slate-500"
                                            title={record.reason}
                                        >
                                            {record.reason}
                                        </p>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-white/6 px-5 py-3 sm:flex-row sm:items-center">
                <p className="text-[10px] leading-5 text-slate-600">
                    Based on order records and associated gateway transactions. This does not confirm bank settlement.
                </p>

                <p className="shrink-0 font-mono text-[10px] text-slate-500">
                    {records.length} displayed
                </p>
            </div>
        </section>
    );
}