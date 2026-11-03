'use client';

import type { PaymentDateRange } from '../lib/payments.types';
import { providerLabel } from '../lib/payments.utils';

export type PaymentStatusFilter =
    | 'ALL'
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED';

type PaymentsFiltersProps = {
    search: string;
    statusFilter: PaymentStatusFilter;
    providerFilter: string;
    dateRange: PaymentDateRange;
    providers: string[];
    hasActiveFilters: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: PaymentStatusFilter) => void;
    onProviderChange: (value: string) => void;
    onDateRangeChange: (value: PaymentDateRange) => void;
    onReset: () => void;
};

export default function PaymentsFilters({
    search,
    statusFilter,
    providerFilter,
    dateRange,
    providers,
    hasActiveFilters,
    onSearchChange,
    onStatusChange,
    onProviderChange,
    onDateRangeChange,
    onReset,
}: PaymentsFiltersProps) {
    return (
        <section className="ph-glass-panel p-5">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-sm font-bold text-white">
                        Find transactions
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Search and filter the payment records in this workspace.
                    </p>
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="self-start text-xs font-bold text-indigo-300 transition hover:text-indigo-200 sm:self-auto"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.6fr)_repeat(3,minmax(140px,1fr))]">
                <div className="min-w-0">
                    <label
                        htmlFor="payment-search"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                    >
                        Search
                    </label>

                    <div className="relative">
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            fill="none"
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        >
                            <circle
                                cx="8.5"
                                cy="8.5"
                                r="5.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="m13 13 4 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>

                        <input
                            id="payment-search"
                            type="search"
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Customer, order or reference..."
                            className="w-full rounded-lg border border-white/10 bg-slate-950/60 py-2.5 pl-9 pr-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="payment-status-filter"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                    >
                        Payment status
                    </label>

                    <select
                        id="payment-status-filter"
                        value={statusFilter}
                        onChange={(event) => onStatusChange(event.target.value as PaymentStatusFilter)}
                        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-400/50"
                    >
                        <option value="ALL">All statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="payment-provider-filter"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                    >
                        Provider
                    </label>

                    <select
                        id="payment-provider-filter"
                        value={providerFilter}
                        onChange={(event) => onProviderChange(event.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-400/50"
                    >
                        <option value="ALL">All providers</option>

                        {providers.map((provider) => (
                            <option key={provider} value={provider}>
                                {providerLabel(provider)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="payment-date-filter"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                    >
                        Date range
                    </label>

                    <select
                        id="payment-date-filter"
                        value={dateRange}
                        onChange={(event) => onDateRangeChange(event.target.value as PaymentDateRange)}
                        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-400/50"
                    >
                        <option value="ALL">All loaded records</option>
                        <option value="TODAY">Today</option>
                        <option value="7D">Last 7 days</option>
                        <option value="30D">Last 30 days</option>
                    </select>
                </div>
            </div>
        </section>
    );
}
