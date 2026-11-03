'use client';

import {
    useMemo,
    useState,
} from 'react';

import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

import ReconciliationSummary from './components/ReconciliationSummary';
import ReconciliationLedger from './components/ReconciliationLedger';

import { useReconciliation } from './hooks/useReconciliation';

import type {
    ReconciliationDateRange,
    ReconciliationStatusFilter,
} from './lib/reconciliation.types';

import {
    buildReconciliationRecords,
    downloadReconciliationCsv,
} from './lib/reconciliation.utils';

import {
    formatDate,
    isWithinDateRange,
} from '../orders/lib/orders.utils';

export default function ReconciliationPage() {
    const { isAuthenticated, isChecking } = useAuthGuard();

    const {
        orders,
        loading,
        refreshing,
        error,
        lastUpdated,
        refresh,
        retry,
    } = useReconciliation(isAuthenticated && !isChecking);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] =
        useState<ReconciliationStatusFilter>('ALL');
    const [dateRange, setDateRange] =
        useState<ReconciliationDateRange>('ALL');

    const reconciliationRecords = useMemo(
        () => buildReconciliationRecords(orders),
        [orders],
    );

    const dateFilteredRecords = useMemo(
        () =>
            reconciliationRecords.filter((record) =>
                isWithinDateRange(record.order.createdAt, dateRange),
            ),
        [reconciliationRecords, dateRange],
    );

    const filteredRecords = useMemo(() => {
        const query = search.trim().toLowerCase();

        return dateFilteredRecords.filter((record) => {
            const searchablePayments = record.order.payments
                .map((payment) =>
                    [
                        payment.provider,
                        payment.providerReference,
                        payment.transactionReference,
                        payment.paymentRequestId,
                        payment.providerStatusMessage,
                        payment.status,
                    ].join(' '),
                )
                .join(' ');

            const searchable = [
                record.order.reference,
                record.order.id,
                record.order.customerName,
                record.order.email,
                record.order.contactNumber,
                record.order.itemsSummary,
                record.order.rawPaymentStatus,
                record.reason,
                searchablePayments,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchesSearch =
                !query || searchable.includes(query);

            const matchesStatus =
                statusFilter === 'ALL' ||
                record.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [
        dateFilteredRecords,
        search,
        statusFilter,
    ]);

    const hasActiveFilters =
        search.trim() !== '' ||
        statusFilter !== 'ALL' ||
        dateRange !== 'ALL';

    function resetFilters() {
        setSearch('');
        setStatusFilter('ALL');
        setDateRange('ALL');
    }

    if (isChecking || !isAuthenticated) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="font-mono text-xs tracking-widest text-slate-500">
                    CHECKING SESSION...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col justify-between gap-5 border-b border-white/6 pb-6 xl:flex-row xl:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

                        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                            Finance / Reconciliation
                        </p>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white">
                        Payment Reconciliation
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Compare recorded gateway payments against customer
                        order totals and identify outstanding balances or
                        exceptions.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.02] px-3 py-2">
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                error
                                    ? 'bg-rose-400'
                                    : loading
                                      ? 'animate-pulse bg-amber-400'
                                      : 'bg-emerald-400'
                            }`}
                        />

                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                            {error
                                ? 'Connection issue'
                                : loading
                                  ? 'Loading'
                                  : 'Connected'}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            downloadReconciliationCsv(filteredRecords)
                        }
                        disabled={
                            loading ||
                            filteredRecords.length === 0
                        }
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ↓ Export CSV
                    </button>

                    <button
                        type="button"
                        onClick={() => void refresh()}
                        disabled={refreshing || loading}
                        className="rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {refreshing ? 'Refreshing...' : '↻ Refresh'}
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                <span>
                    {lastUpdated
                        ? `Last refreshed ${formatDate(lastUpdated.toISOString())}`
                        : 'Waiting for order records'}
                </span>

                <span>Automatically refreshes every minute</span>
            </div>

            {error && (
                <div
                    role="alert"
                    className="flex flex-col justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4 sm:flex-row sm:items-center"
                >
                    <div>
                        <p className="text-sm font-semibold text-rose-300">
                            We couldn't load reconciliation records.
                        </p>

                        <p className="mt-1 break-words text-xs text-slate-400">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void retry()}
                        className="shrink-0 rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-bold text-rose-200 transition hover:bg-rose-500/10"
                    >
                        Try again
                    </button>
                </div>
            )}

            <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-amber-300">
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-4 w-4"
                        >
                            <path
                                d="M10 6.5v4m0 3h.01M8.27 3.9 1.9 15a1.2 1.2 0 0 0 1.04 1.8h14.12A1.2 1.2 0 0 0 18.1 15L11.73 3.9a2 2 0 0 0-3.46 0Z"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>

                    <div>
                        <p className="text-xs font-bold text-amber-200">
                            Gateway-to-order comparison
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-slate-400">
                            These results use payment transactions recorded
                            against orders. Bank statement imports and bank
                            settlement confirmation are not connected yet.
                        </p>
                    </div>
                </div>
            </div>

            <ReconciliationSummary records={dateFilteredRecords} />

            <section className="ph-glass-panel space-y-5 p-5">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Find a reconciliation record
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Search orders, customers, payment providers and
                            transaction references.
                        </p>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="self-start text-xs font-bold text-indigo-300 transition hover:text-indigo-200 sm:self-auto"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.6fr)_repeat(2,minmax(160px,1fr))]">
                    <div>
                        <label
                            htmlFor="reconciliation-search"
                            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            Search
                        </label>

                        <input
                            id="reconciliation-search"
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Order, customer or transaction reference..."
                            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="reconciliation-status"
                            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            Reconciliation status
                        </label>

                        <select
                            id="reconciliation-status"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as ReconciliationStatusFilter,
                                )
                            }
                            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-400/50"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="MATCHED">Matched</option>
                            <option value="PARTIAL">Partially paid</option>
                            <option value="PENDING">Awaiting payment</option>
                            <option value="REVIEW">Needs review</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="reconciliation-date"
                            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            Order date
                        </label>

                        <select
                            id="reconciliation-date"
                            value={dateRange}
                            onChange={(event) =>
                                setDateRange(
                                    event.target.value as ReconciliationDateRange,
                                )
                            }
                            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-400/50"
                        >
                            <option value="ALL">All loaded records</option>
                            <option value="TODAY">Today</option>
                            <option value="7D">Last 7 days</option>
                            <option value="30D">Last 30 days</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/6 pt-4 text-xs text-slate-400">
                    <span>
                        <span className="font-mono font-bold text-white">
                            {filteredRecords.length}
                        </span>{' '}
                        of {dateFilteredRecords.length} records
                    </span>

                    <span className="text-[10px] text-slate-600">
                        Summary reflects the selected date range.
                    </span>
                </div>
            </section>

            <ReconciliationLedger
                records={filteredRecords}
                loading={loading}
                hasLoadedRecords={orders.length > 0}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
            />
        </div>
    );
}