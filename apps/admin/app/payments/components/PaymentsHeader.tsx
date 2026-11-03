'use client';

import type { PaymentRecord } from '../lib/payments.types';
import { formatDate } from '../lib/payments.utils';

type PaymentsHeaderProps = {
    loading: boolean;
    refreshing: boolean;
    error: string;
    lastUpdated: Date | null;
    filteredPayments: PaymentRecord[];
    onRefresh: () => void;
    onExport: () => void;
};

export default function PaymentsHeader({
    loading,
    refreshing,
    error,
    lastUpdated,
    filteredPayments,
    onRefresh,
    onExport,
}: PaymentsHeaderProps) {
    return (
        <>
            <header className="flex flex-col justify-between gap-5 border-b border-white/6 pb-6 xl:flex-row xl:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

                        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                            Finance / Payments
                        </p>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white">
                        Payments &amp; Collections
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Track customer payments, gateway transactions and
                        their associated orders.
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
                        onClick={onExport}
                        disabled={loading || filteredPayments.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-4 w-4"
                        >
                            <path
                                d="M10 3v9m0 0 3-3m-3 3L7 9m-3 4v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        Export CSV
                    </button>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing || loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            fill="none"
                            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                        >
                            <path
                                d="M16 8a6 6 0 0 0-10.8-2L4 8m0-4v4h4m-4 4a6 6 0 0 0 10.8 2L16 12m0 4v-4h-4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                <span>
                    {lastUpdated
                        ? `Last refreshed ${formatDate(lastUpdated.toISOString())}`
                        : 'Waiting for payment records'}
                </span>

                <span>Automatically refreshes every minute</span>
            </div>
        </>
    );
}
