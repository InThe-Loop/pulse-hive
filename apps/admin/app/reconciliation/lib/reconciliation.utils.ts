import type { Order } from '../../orders/lib/orders.types';
import type {
    ReconciliationRecord,
    ReconciliationStatus,
} from './reconciliation.types';

import {
    amountValue,
    money,
} from '../../orders/lib/orders.utils';

export function buildReconciliationRecord(
    order: Order,
): ReconciliationRecord {
    const completedPayments = order.payments.filter(
        (payment) => payment.status === 'COMPLETED',
    );

    const currencyMismatch = completedPayments.some(
        (payment) => (payment.currency || 'ZAR').toUpperCase() !== 'ZAR',
    );

    // Order amounts are currently represented in ZAR.
    // Do not add foreign-currency transactions to a Rand total.
    const completedAmount = completedPayments
        .filter(
            (payment) =>
                (payment.currency || 'ZAR').toUpperCase() === 'ZAR',
        )
        .reduce(
            (sum, payment) => sum + amountValue(payment.amount),
            0,
        );

    const totalAmount = amountValue(order.totalAmount);

    const balance = Math.round(
        (totalAmount - completedAmount) * 100,
    ) / 100;

    const hasRefund =
        order.rawPaymentStatus === 'REFUNDED' ||
        order.payments.some((payment) => payment.status === 'REFUNDED');

    const hasFailedOrCancelledAttempts =
        completedPayments.length === 0 &&
        (
            order.rawPaymentStatus === 'FAILED' ||
            order.rawPaymentStatus === 'CANCELLED' ||
            order.payments.some(
                (payment) =>
                    payment.status === 'FAILED' ||
                    payment.status === 'CANCELLED',
            )
        );

    const markedCompletedWithoutTransaction =
        order.rawPaymentStatus === 'COMPLETED' &&
        completedPayments.length === 0;

    let status: ReconciliationStatus;
    let reason: string;

    if (currencyMismatch) {
        status = 'REVIEW';
        reason =
            'A completed payment uses a currency other than ZAR. Review the conversion before comparing totals.';
    } else if (hasRefund) {
        status = 'REVIEW';
        reason = 'A refund is recorded and requires review.';
    } else if (balance < -0.01) {
        status = 'REVIEW';
        reason = `Completed gateway payments exceed the order total by ${money(Math.abs(balance))}.`;
    } else if (markedCompletedWithoutTransaction) {
        status = 'REVIEW';
        reason =
            'The order is marked as paid, but no completed payment transaction is available.';
    } else if (hasFailedOrCancelledAttempts) {
        status = 'REVIEW';
        reason =
            'The available payment attempts failed or were cancelled.';
    } else if (
        totalAmount > 0 &&
        completedPayments.length > 0 &&
        balance <= 0.01
    ) {
        status = 'MATCHED';
        reason =
            'Recorded completed gateway payments equal the order total.';
    } else if (completedAmount > 0) {
        status = 'PARTIAL';
        reason = `${money(Math.max(balance, 0))} remains outstanding against this order.`;
    } else {
        status = 'PENDING';
        reason =
            'No completed gateway payment is currently recorded for this order.';
    }

    return {
        order,
        status,
        completedAmount,
        balance,
        completedPaymentCount: completedPayments.length,
        currencyMismatch,
        reason,
    };
}

export function buildReconciliationRecords(
    orders: Order[],
): ReconciliationRecord[] {
    return orders
        .map(buildReconciliationRecord)
        .sort(
            (a, b) =>
                new Date(b.order.createdAt).getTime() -
                new Date(a.order.createdAt).getTime(),
        );
}

export function reconciliationStatusLabel(
    status: ReconciliationStatus,
): string {
    const labels: Record<ReconciliationStatus, string> = {
        MATCHED: 'Matched',
        PARTIAL: 'Partially paid',
        PENDING: 'Awaiting payment',
        REVIEW: 'Needs review',
    };

    return labels[status];
}

export function reconciliationStatusClasses(
    status: ReconciliationStatus,
): string {
    const classes: Record<ReconciliationStatus, string> = {
        MATCHED:
            'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
        PARTIAL:
            'border-amber-400/20 bg-amber-400/10 text-amber-300',
        PENDING:
            'border-slate-400/20 bg-slate-400/10 text-slate-300',
        REVIEW:
            'border-rose-400/20 bg-rose-400/10 text-rose-300',
    };

    return classes[status];
}

export function formatReconciliationAmount(
    value: number | string,
    currency = 'ZAR',
): string {
    const amount = amountValue(value);

    if (currency.toUpperCase() === 'ZAR') {
        return money(amount);
    }

    return `${currency.toUpperCase()} ${amount.toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function csvCell(value: unknown): string {
    let text = String(value ?? '');

    // Reduce the risk of spreadsheet formula injection.
    if (/^[\s]*[=+\-@\t\r]/.test(text)) {
        text = `'${text}`;
    }

    return `"${text.replaceAll('"', '""')}"`;
}

export function downloadReconciliationCsv(
    records: ReconciliationRecord[],
): void {
    const headers = [
        'Order reference',
        'Order date',
        'Customer',
        'Customer email',
        'Order total ZAR',
        'Completed gateway payments ZAR',
        'Outstanding balance ZAR',
        'Reconciliation status',
        'Payment transaction count',
        'Payment providers',
        'Payment references',
        'Review note',
    ];

    const rows = records.map((record) => {
        const payments = record.order.payments;

        const providers = payments
            .map((payment) => payment.provider || '')
            .filter(Boolean);

        const references = payments.map(
            (payment) =>
                payment.providerReference ||
                payment.transactionReference ||
                payment.paymentRequestId ||
                payment.id,
        );

        return [
            record.order.reference,
            record.order.createdAt,
            record.order.customerName,
            record.order.email,
            record.order.totalAmount,
            record.completedAmount,
            record.balance,
            reconciliationStatusLabel(record.status),
            payments.length,
            [...new Set(providers)].join('; '),
            references.join('; '),
            record.reason,
        ];
    });

    const csv = [headers, ...rows]
        .map((row) => row.map(csvCell).join(','))
        .join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
        type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `pulsehive-reconciliation-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}