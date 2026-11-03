'use client';

import { useMemo, useState } from 'react';

import PaymentDetailsDrawer from './components/PaymentDetailsDrawer';
import PaymentsFilters, {
    type PaymentStatusFilter,
} from './components/PaymentsFilters';
import PaymentsHeader from './components/PaymentsHeader';
import PaymentsSummary from './components/PaymentsSummary';
import PaymentsTable from './components/PaymentsTable';
import { usePayments } from './hooks/usePayments';

import type {
    PaymentDateRange,
    PaymentRecord,
    PaymentSummary,
} from './lib/payments.types';

import {
    downloadPaymentsCsv,
    formatPaymentTotals,
    isWithinDateRange,
    paymentActivityDate,
} from './lib/payments.utils';

export default function PaymentsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('ALL');
    const [providerFilter, setProviderFilter] = useState('ALL');
    const [dateRange, setDateRange] = useState<PaymentDateRange>('ALL');
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

    const {
        payments,
        loading,
        refreshing,
        error,
        lastUpdated,
        fetchPayments,
        isAuthenticated,
        isChecking,
    } = usePayments();

    const dateFilteredPayments = useMemo(
        () => payments.filter((payment) => isWithinDateRange(payment, dateRange)),
        [payments, dateRange],
    );

    const summary = useMemo<PaymentSummary>(() => {
        const completed = dateFilteredPayments.filter(
            (payment) => payment.status === 'COMPLETED',
        );

        const pending = dateFilteredPayments.filter(
            (payment) => payment.status === 'PENDING',
        );

        return {
            completedCount: completed.length,
            failedCount: dateFilteredPayments.filter(
                (payment) => payment.status === 'FAILED',
            ).length,
            completedValue: formatPaymentTotals(completed),
            pendingValue: formatPaymentTotals(pending),
        };
    }, [dateFilteredPayments]);

    const providers = useMemo(
        () => Array.from(
            new Set(
                payments
                    .map((payment) => payment.provider)
                    .filter(Boolean),
            ),
        ).sort(),
        [payments],
    );

    const filteredPayments = useMemo(() => {
        const query = search.trim().toLowerCase();

        return dateFilteredPayments
            .filter((payment) => {
                const searchable = [
                    payment.id,
                    payment.customerName,
                    payment.customerEmail,
                    payment.customerPhone,
                    payment.order?.reference,
                    payment.provider,
                    payment.providerReference,
                    payment.transactionReference,
                    payment.paymentRequestId,
                    payment.providerStatusMessage,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                const matchesSearch = !query || searchable.includes(query);
                const matchesStatus =
                    statusFilter === 'ALL' || payment.status === statusFilter;
                const matchesProvider =
                    providerFilter === 'ALL' || payment.provider === providerFilter;

                return matchesSearch && matchesStatus && matchesProvider;
            })
            .sort(
                (a, b) =>
                    new Date(paymentActivityDate(b)).getTime() -
                    new Date(paymentActivityDate(a)).getTime(),
            );
    }, [dateFilteredPayments, search, statusFilter, providerFilter]);

    const hasActiveFilters =
        search.trim() !== '' ||
        statusFilter !== 'ALL' ||
        providerFilter !== 'ALL' ||
        dateRange !== 'ALL';

    function resetFilters() {
        setSearch('');
        setStatusFilter('ALL');
        setProviderFilter('ALL');
        setDateRange('ALL');
    }

    function exportPayments() {
        downloadPaymentsCsv(filteredPayments);
    }

    if (isChecking || !isAuthenticated) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-xs font-mono tracking-widest text-slate-500">
                    CHECKING SESSION...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PaymentsHeader
                loading={loading}
                refreshing={refreshing}
                error={error}
                lastUpdated={lastUpdated}
                filteredPayments={filteredPayments}
                onRefresh={() => void fetchPayments()}
                onExport={exportPayments}
            />

            {error && (
                <div
                    role="alert"
                    className="flex flex-col justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4 sm:flex-row sm:items-center"
                >
                    <div>
                        <p className="text-sm font-semibold text-rose-300">
                            We couldn't load payment records.
                        </p>

                        <p className="mt-1 break-words text-xs text-slate-400">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void fetchPayments(true)}
                        className="shrink-0 rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-bold text-rose-200 transition hover:bg-rose-500/10"
                    >
                        Try again
                    </button>
                </div>
            )}

            <PaymentsSummary summary={summary} />

            <PaymentsFilters
                search={search}
                statusFilter={statusFilter}
                providerFilter={providerFilter}
                dateRange={dateRange}
                providers={providers}
                hasActiveFilters={hasActiveFilters}
                onSearchChange={setSearch}
                onStatusChange={setStatusFilter}
                onProviderChange={setProviderFilter}
                onDateRangeChange={setDateRange}
                onReset={resetFilters}
            />

            <PaymentsTable
                payments={payments}
                filteredPayments={filteredPayments}
                loading={loading}
                hasActiveFilters={hasActiveFilters}
                onSelectPayment={setSelectedPayment}
                onResetFilters={resetFilters}
            />

            <PaymentDetailsDrawer
                payment={selectedPayment}
                onClose={() => setSelectedPayment(null)}
            />
        </div>
    );
}
