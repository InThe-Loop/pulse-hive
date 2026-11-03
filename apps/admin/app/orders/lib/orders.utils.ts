import type { ApiOrder, ApiPayment, DateRange, Order, PaymentLabel } from './orders.types';

export const money = (amount: number) =>
    `R ${amount.toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const amountValue = (
    value: number | string | null | undefined,
): number => {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
};

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
        PENDING_PAYMENT: 'Pending payment',
        PAID: 'Paid',
        PROCESSING: 'Processing',
        PACKED: 'Packed',
        READY_TO_SHIP: 'Ready to ship',
        READY_FOR_DISPATCH: 'Ready for dispatch',
        SHIPPED: 'Shipped',
        DISPATCHED: 'Dispatched',
        DELIVERED: 'Delivered',
        NOT_STARTED: 'Not started',
        ON_HOLD: 'On hold',
        DELIVERY_FAILED: 'Delivery failed',
        CANCELLED: 'Cancelled',
        REFUNDED: 'Refunded',
        PENDING: 'Pending',
        COMPLETED: 'Completed',
        FAILED: 'Failed',
        PARTIAL: 'Partially paid',
        FLAGGED: 'Needs attention',
    };

    return labels[status] ?? status.replaceAll('_', ' ');
}

export function paymentLabel(order: ApiOrder): PaymentLabel {
    const total = amountValue(order.totalAmount);

    const completedPayments = order.payments
        .filter((payment) => payment.status === 'COMPLETED')
        .reduce((sum, payment) => sum + amountValue(payment.amount), 0);

    if (
        order.paymentStatus === 'REFUNDED' ||
        order.paymentStatus === 'FAILED' ||
        order.paymentStatus === 'CANCELLED'
    ) {
        return 'FLAGGED';
    }

    if (
        order.paymentStatus === 'COMPLETED' ||
        ['PAID', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED']
            .includes(order.status)
    ) {
        return 'PAID';
    }

    if (completedPayments > 0 && completedPayments < total) {
        return 'PARTIAL';
    }

    if (completedPayments >= total && total > 0) {
        return 'PAID';
    }

    return 'PENDING';
}

export function mapOrder(order: ApiOrder): Order {
    const items = order.items ?? [];
    const payments = [...(order.payments ?? [])].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
    );

    return {
        id: order.id,
        reference: order.reference,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status,
        rawPaymentStatus: order.paymentStatus,
        paymentStatus: paymentLabel(order),
        customerName: order.customer?.name || 'Guest customer',
        contactNumber: order.customer?.phone || '',
        email: order.customer?.email || '',
        customerAddress: order.customer?.address || '',
        items,
        itemsSummary: items.length
            ? items
                .map((item) => `${item.productName} × ${item.quantity}`)
                .join(', ')
            : 'No item details',
        subtotal: amountValue(order.subtotal),
        shippingFee: amountValue(order.shippingFee),
        totalAmount: amountValue(order.totalAmount),
        shippingMethod: order.shippingMethod || '',
        deliveryAddress: order.deliveryAddress || '',
        trackingNumber: order.trackingNumber || '',
        payments,
        fulfilment: order.fulfilment ?? null,
    };
}

export function latestPayment(order: Order): ApiPayment | undefined {
    return order.payments[0];
}

export function paymentReference(order: Order): string {
    const payment = latestPayment(order);

    return (
        payment?.providerReference ||
        payment?.transactionReference ||
        order.reference
    );
}

export function statusClasses(status: string): string {
    switch (status) {
        case 'PAID':
        case 'COMPLETED':
        case 'DELIVERED':
            return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300';

        case 'PROCESSING':
        case 'PACKED':
        case 'READY_TO_SHIP':
        case 'READY_FOR_DISPATCH':
        case 'SHIPPED':
        case 'DISPATCHED':
            return 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300';

        case 'FLAGGED':
        case 'FAILED':
        case 'CANCELLED':
        case 'REFUNDED':
        case 'DELIVERY_FAILED':
            return 'border-rose-400/20 bg-rose-400/10 text-rose-300';

        case 'PARTIAL':
        case 'ON_HOLD':
            return 'border-amber-400/20 bg-amber-400/10 text-amber-300';

        default:
            return 'border-amber-400/20 bg-amber-400/10 text-amber-300';
    }
}

export function isWithinDateRange(dateValue: string, range: DateRange): boolean {
    if (range === 'ALL') return true;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();

    if (range === 'TODAY') {
        const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );

        const end = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
        );

        return date >= start && date < end;
    }

    const days = range === '7D' ? 7 : 30;
    const start = new Date(now);
    start.setDate(start.getDate() - days);

    return date >= start && date <= now;
}

export function escapeCsv(value: unknown): string {
    const text = String(value ?? '');

    return `"${text.replaceAll('"', '""')}"`;
}

export function downloadCsv(orders: Order[]) {
    const headers = [
        'Order reference',
        'Created at',
        'Customer',
        'Email',
        'Phone',
        'Products',
        'Subtotal',
        'Shipping fee',
        'Total',
        'Order status',
        'Payment status',
        'Payment provider',
        'Payment reference',
        'Tracking number',
        'Delivery address',
        'Fulfilment status',
        'Delivery provider',
        'Fulfilment tracking reference',
        'Fulfilment notes',
    ];

    const rows = orders.map((order) => {
        const payment = latestPayment(order);

        return [
            order.reference,
            order.createdAt,
            order.customerName,
            order.email,
            order.contactNumber,
            order.itemsSummary,
            order.subtotal,
            order.shippingFee,
            order.totalAmount,
            order.status,
            order.rawPaymentStatus,
            payment?.provider ?? '',
            paymentReference(order),
            order.trackingNumber,
            order.deliveryAddress || order.customerAddress,
            order.fulfilment?.status ?? 'NOT_STARTED',
            order.fulfilment?.deliveryProvider ?? '',
            order.fulfilment?.trackingReference ?? '',
            order.fulfilment?.operationalNotes ?? '',
        ];
    });

    const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(','))
        .join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
        type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `pulsehive-orders-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}
