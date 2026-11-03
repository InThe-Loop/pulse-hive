import type {
    PaymentDateRange,
    PaymentRecord,
} from './payments.types';

export function amountValue(
    value: number | string | null | undefined,
): number {
    const parsed = Number(value ?? 0);

    return Number.isFinite(parsed) ? parsed : 0;
}

export function money(
    value: number,
    currency = 'ZAR',
): string {
    const formatted = value.toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return currency.toUpperCase() === 'ZAR'
        ? `R ${formatted}`
        : `${currency.toUpperCase()} ${formatted}`;
}

export function paymentActivityDate(payment: PaymentRecord): string {
    if (payment.status === 'COMPLETED' && payment.completedAt) {
        return payment.completedAt;
    }

    return payment.createdAt;
}

export function formatDate(value?: string | null): string {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-ZA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function statusLabel(status: string): string {
    const labels: Record<string, string> = {
        PENDING: 'Pending',
        COMPLETED: 'Completed',
        FAILED: 'Failed',
        CANCELLED: 'Cancelled',
        REFUNDED: 'Refunded',
    };

    return labels[status] ?? status.replaceAll('_', ' ');
}

export function statusClasses(status: string): string {
    switch (status) {
        case 'COMPLETED':
            return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300';

        case 'PENDING':
            return 'border-amber-400/20 bg-amber-400/10 text-amber-300';

        case 'FAILED':
            return 'border-rose-400/20 bg-rose-400/10 text-rose-300';

        case 'CANCELLED':
            return 'border-slate-400/20 bg-slate-400/10 text-slate-300';

        case 'REFUNDED':
            return 'border-violet-400/20 bg-violet-400/10 text-violet-300';

        default:
            return 'border-white/10 bg-white/[0.04] text-slate-300';
    }
}

export function paymentReference(payment: PaymentRecord): string {
    return (
        payment.providerReference ||
        payment.transactionReference ||
        payment.paymentRequestId ||
        payment.id
    );
}

export function providerLabel(provider: string): string {
    return provider.replaceAll('_', ' ');
}

export function isWithinDateRange(
    payment: PaymentRecord,
    range: PaymentDateRange,
): boolean {
    if (range === 'ALL') return true;

    const timestamp = new Date(paymentActivityDate(payment)).getTime();

    if (!Number.isFinite(timestamp)) return false;

    const date = new Date(timestamp);
    const now = new Date();

    if (date > now) return false;

    if (range === 'TODAY') {
        const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );

        return date >= start;
    }

    const days = range === '7D' ? 7 : 30;
    const start = new Date(now);
    start.setDate(start.getDate() - days);

    return date >= start;
}

function currencyTotals(payments: PaymentRecord[]): Map<string, number> {
    const totals = new Map<string, number>();

    for (const payment of payments) {
        const currency = (payment.currency || 'ZAR').toUpperCase();

        totals.set(
            currency,
            (totals.get(currency) ?? 0) + amountValue(payment.amount),
        );
    }

    return totals;
}

export function formatPaymentTotals(
    payments: PaymentRecord[],
): string {
    const totals = currencyTotals(payments);

    if (totals.size === 0) {
        return money(0);
    }

    return Array.from(totals.entries())
        .map(([currency, total]) => money(total, currency))
        .join(' · ');
}

function escapeCsv(value: unknown): string {
    let text = String(value ?? '');

    // Prevent spreadsheet formula execution from imported text values.
    if (/^[=+\-@]/.test(text)) {
        text = `'${text}`;
    }

    return `"${text.replaceAll('"', '""')}"`;
}

export function downloadPaymentsCsv(payments: PaymentRecord[]): void {
    const headers = [
        'Payment ID',
        'Activity Date',
        'Created At',
        'Completed At',
        'Customer',
        'Customer Email',
        'Customer Phone',
        'Order Reference',
        'Provider',
        'Provider Reference',
        'Transaction Reference',
        'Payment Request ID',
        'Amount',
        'Currency',
        'Status',
        'Provider Status Message',
    ];

    const rows = payments.map((payment) => [
        payment.id,
        paymentActivityDate(payment),
        payment.createdAt,
        payment.completedAt ?? '',
        payment.customerName ?? '',
        payment.customerEmail ?? '',
        payment.customerPhone ?? '',
        payment.order?.reference ?? '',
        payment.provider,
        payment.providerReference ?? '',
        payment.transactionReference ?? '',
        payment.paymentRequestId ?? '',
        amountValue(payment.amount).toFixed(2),
        payment.currency ?? 'ZAR',
        payment.status,
        payment.providerStatusMessage ?? '',
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(','))
        .join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
        type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `pulsehive-payments-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}
