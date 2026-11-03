import type { Activity, ChartPeriod, DailyMetric, Order, Payment } from '../types/dashboard.types';

export const amount = (value: number | string | null | undefined): number => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const money = (value: number): string =>
    `R ${value.toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const compactMoney = (value: number): string => {
    if (value >= 1_000_000) {
        return `R${(value / 1_000_000).toLocaleString('en-ZA', {
            maximumFractionDigits: 1,
        })}m`;
    }

    if (value >= 1_000) {
        return `R${(value / 1_000).toLocaleString('en-ZA', {
            maximumFractionDigits: 1,
        })}k`;
    }

    return `R${Math.round(value).toLocaleString('en-ZA')}`;
};

export const relativeTime = (value: string): string => {
    const time = new Date(value).getTime();

    if (!Number.isFinite(time)) {
        return 'Date unavailable';
    }

    const minutes = Math.max(0, Math.floor((Date.now() - time) / 60_000));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days}d ago`;

    return new Intl.DateTimeFormat('en-ZA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(time));
};

const localDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatChartDate = (
    date: Date,
    options: Intl.DateTimeFormatOptions,
): string => new Intl.DateTimeFormat('en-ZA', options).format(date);

const paymentTimestamp = (payment: Payment): string =>
    payment.completedAt || payment.updatedAt || payment.createdAt;

export const paid = (order: Order): boolean =>
    ['PAID', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(order.status)
    || order.paymentStatus === 'COMPLETED'
    || (order.payments ?? []).some((payment) => payment.status === 'COMPLETED');

export const pendingPayment = (order: Order): boolean => {
    if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
        return false;
    }

    if (paid(order)) {
        return false;
    }

    return order.status === 'PENDING_PAYMENT'
        || order.paymentStatus === 'PENDING'
        || (order.payments ?? []).some((payment) => payment.status === 'PENDING');
};

export const orderRevenue = (order: Order): number => {
    const completed = (order.payments ?? []).filter(
        (payment) => payment.status === 'COMPLETED',
    );

    if (completed.length) {
        return completed.reduce((sum, payment) => sum + amount(payment.amount), 0);
    }

    return paid(order) && (order.payments ?? []).length === 0
        ? amount(order.totalAmount)
        : 0;
};

export const buildActivity = (orders: Order[]): Activity[] => {
    const events: Activity[] = [];

    for (const order of orders) {
        events.push({
            id: `order-${order.id}`,
            title: 'New order recorded',
            detail: `${order.reference}${order.customer?.name ? ` · ${order.customer.name}` : ''} · ${money(amount(order.totalAmount))}`,
            timestamp: order.createdAt,
            kind: 'order',
        });

        for (const payment of order.payments ?? []) {
            const timestamp = payment.status === 'COMPLETED'
                ? paymentTimestamp(payment)
                : payment.updatedAt || payment.createdAt;

            const labels: Record<string, string> = {
                COMPLETED: 'Payment completed',
                FAILED: 'Payment failed',
                CANCELLED: 'Payment cancelled',
                REFUNDED: 'Payment refunded',
                PENDING: 'Payment initiated',
            };

            events.push({
                id: `payment-${payment.id}`,
                title: labels[payment.status] ?? 'Payment status updated',
                detail: `${order.reference} · ${money(amount(payment.amount))}${payment.provider ? ` · ${payment.provider}` : ''}`,
                timestamp,
                kind: 'payment',
            });
        }
    }

    return events
        .filter((event) => Number.isFinite(new Date(event.timestamp).getTime()))
        .sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 6);
};

export const buildDailyMetrics = (
    orders: Order[],
    period: ChartPeriod,
    today: Date,
): DailyMetric[] => {
    const days: DailyMetric[] = [];
    const revenueByDate = new Map<string, number>();
    const ordersByDate = new Map<string, number>();

    const firstDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    firstDay.setDate(firstDay.getDate() - (period - 1));

    for (let index = 0; index < period; index += 1) {
        const date = new Date(firstDay);
        date.setDate(firstDay.getDate() + index);

        const key = localDateKey(date);

        days.push({
            key,
            label: formatChartDate(date, {
                day: 'numeric',
                month: 'short',
            }),
            fullLabel: formatChartDate(date, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }),
            revenue: 0,
            orders: 0,
        });

        revenueByDate.set(key, 0);
        ordersByDate.set(key, 0);
    }

    const firstKey = days[0]?.key;
    const lastKey = days[days.length - 1]?.key;

    if (!firstKey || !lastKey) {
        return days;
    }

    for (const order of orders) {
        const createdAt = new Date(order.createdAt);

        if (!Number.isFinite(createdAt.getTime())) {
            continue;
        }

        const orderDate = localDateKey(createdAt);

        if (orderDate >= firstKey && orderDate <= lastKey) {
            ordersByDate.set(orderDate, (ordersByDate.get(orderDate) ?? 0) + 1);
        }

        for (const payment of order.payments ?? []) {
            if (payment.status !== 'COMPLETED') {
                continue;
            }

            const completedAt = new Date(paymentTimestamp(payment));

            if (!Number.isFinite(completedAt.getTime())) {
                continue;
            }

            const paymentDate = localDateKey(completedAt);

            if (paymentDate < firstKey || paymentDate > lastKey) {
                continue;
            }

            revenueByDate.set(
                paymentDate,
                (revenueByDate.get(paymentDate) ?? 0) + amount(payment.amount),
            );
        }
    }

    return days.map((day) => ({
        ...day,
        revenue: revenueByDate.get(day.key) ?? 0,
        orders: ordersByDate.get(day.key) ?? 0,
    }));
};
