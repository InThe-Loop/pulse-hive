'use client';

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import Link from 'next/link';

import { apiCall } from '@/lib/api-client';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

import type {
    ApiOrder,
    ApiPayment,
} from '../orders/lib/orders.types';

import { statusLabel } from '../orders/lib/orders.utils';

type NotificationCategory =
    | 'ORDER'
    | 'PAYMENT'
    | 'FULFILMENT';

type NotificationSeverity =
    | 'INFO'
    | 'SUCCESS'
    | 'WARNING'
    | 'DANGER';

type NotificationEvent = {
    id: string;
    category: NotificationCategory;
    severity: NotificationSeverity;
    title: string;
    description: string;
    orderReference: string;
    occurredAt: string;
};

type CategoryFilter = 'ALL' | NotificationCategory;

const REFRESH_INTERVAL_MS = 60_000;
const MAX_NOTIFICATIONS = 100;

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Date unavailable';
    }

    return new Intl.DateTimeFormat('en-ZA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatRelativeTime(value: string): string {
    const timestamp = new Date(value).getTime();

    if (!Number.isFinite(timestamp)) {
        return 'Date unavailable';
    }

    const elapsedMinutes = Math.max(
        0,
        Math.floor((Date.now() - timestamp) / 60_000),
    );

    if (elapsedMinutes < 1) return 'Just now';
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

    const elapsedHours = Math.floor(elapsedMinutes / 60);

    if (elapsedHours < 24) return `${elapsedHours}h ago`;

    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedDays < 7) return `${elapsedDays}d ago`;

    return formatDate(value);
}

function formatMoney(
    value: number | string,
    currency = 'ZAR',
): string {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return `${currency} —`;
    }

    const formatted = amount.toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return currency.toUpperCase() === 'ZAR'
        ? `R ${formatted}`
        : `${currency.toUpperCase()} ${formatted}`;
}

function paymentNotification(
    payment: ApiPayment,
    orderReference: string,
): NotificationEvent | null {
    const occurredAt =
        payment.status === 'COMPLETED'
            ? payment.completedAt || payment.updatedAt || payment.createdAt
            : payment.updatedAt || payment.createdAt;

    const provider = payment.provider || 'Payment gateway';
    const amount = formatMoney(
        payment.amount,
        payment.currency || 'ZAR',
    );

    let title = 'Payment updated';
    let description = `${provider} reported an update for order ${orderReference}.`;
    let severity: NotificationSeverity = 'INFO';

    switch (payment.status) {
        case 'PENDING':
            title = 'Payment initiated';
            description = `${amount} payment initiated through ${provider} for order ${orderReference}.`;
            severity = 'INFO';
            break;

        case 'COMPLETED':
            title = 'Payment completed';
            description = `${amount} received through ${provider} for order ${orderReference}.`;
            severity = 'SUCCESS';
            break;

        case 'FAILED':
            title = 'Payment failed';
            description = `${amount} payment failed through ${provider} for order ${orderReference}.`;
            severity = 'DANGER';
            break;

        case 'CANCELLED':
            title = 'Payment cancelled';
            description = `${amount} payment was cancelled through ${provider} for order ${orderReference}.`;
            severity = 'WARNING';
            break;

        case 'REFUNDED':
            title = 'Payment refunded';
            description = `${amount} payment was marked as refunded through ${provider} for order ${orderReference}.`;
            severity = 'WARNING';
            break;
    }

    return {
        id: `payment:${payment.id}:${payment.status}:${occurredAt}`,
        category: 'PAYMENT',
        severity,
        title,
        description,
        orderReference,
        occurredAt,
    };
}

function buildNotifications(
    orders: ApiOrder[],
): NotificationEvent[] {
    const events: NotificationEvent[] = [];

    for (const order of orders) {
        if (order.createdAt) {
            events.push({
                id: `order:${order.id}:${order.createdAt}`,
                category: 'ORDER',
                severity: 'INFO',
                title: 'New order received',
                description: `${order.reference} was placed by ${
                    order.customer?.name || 'a guest customer'
                }.`,
                orderReference: order.reference,
                occurredAt: order.createdAt,
            });
        }

        for (const payment of order.payments ?? []) {
            const event = paymentNotification(
                payment,
                order.reference,
            );

            if (event) {
                events.push(event);
            }
        }

        for (const entry of order.fulfilment?.history ?? []) {
            if (entry.previousStatus === entry.newStatus) {
                continue;
            }

            const isException = [
                'ON_HOLD',
                'DELIVERY_FAILED',
            ].includes(entry.newStatus);

            const previousStatus = entry.previousStatus
                ? statusLabel(entry.previousStatus)
                : 'Not started';

            const nextStatus = statusLabel(entry.newStatus);

            const note = entry.note?.trim();

            events.push({
                id: `fulfilment:${entry.id}`,
                category: 'FULFILMENT',
                severity:
                    entry.newStatus === 'DELIVERED'
                        ? 'SUCCESS'
                        : entry.newStatus === 'DELIVERY_FAILED'
                            ? 'DANGER'
                            : isException
                                ? 'WARNING'
                                : 'INFO',
                title: `Fulfilment ${nextStatus.toLowerCase()}`,
                description: note
                    ? `${order.reference} moved from ${previousStatus} to ${nextStatus}. ${note}`
                    : `${order.reference} moved from ${previousStatus} to ${nextStatus}.`,
                orderReference: order.reference,
                occurredAt: entry.createdAt,
            });
        }
    }

    return events
        .filter((event) => Number.isFinite(
            new Date(event.occurredAt).getTime(),
        ))
        .sort(
            (a, b) =>
                new Date(b.occurredAt).getTime() -
                new Date(a.occurredAt).getTime(),
        )
        .slice(0, MAX_NOTIFICATIONS);
}

function severityClasses(severity: NotificationSeverity): string {
    switch (severity) {
        case 'SUCCESS':
            return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300';

        case 'WARNING':
            return 'border-amber-400/20 bg-amber-400/10 text-amber-300';

        case 'DANGER':
            return 'border-rose-400/20 bg-rose-400/10 text-rose-300';

        case 'INFO':
        default:
            return 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300';
    }
}

function categoryLabel(category: NotificationCategory): string {
    switch (category) {
        case 'ORDER':
            return 'Order';

        case 'PAYMENT':
            return 'Payment';

        case 'FULFILMENT':
            return 'Fulfilment';
    }
}

function SummaryCard({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="ph-glass-panel min-w-0 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {label}
            </p>

            <p className="mt-3 font-mono text-2xl font-black tracking-tight text-white">
                {value}
            </p>

            <p className="mt-2 text-[11px] text-slate-500">
                {description}
            </p>
        </div>
    );
}

export default function NotificationsPage() {
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] =
        useState<CategoryFilter>('ALL');
    const [unreadOnly, setUnreadOnly] = useState(false);

    const [readIds, setReadIds] = useState<string[]>([]);
    const [readStorageKey, setReadStorageKey] = useState('');
    const [readStateLoaded, setReadStateLoaded] = useState(false);

    const { isAuthenticated, isChecking } = useAuthGuard();

    const fetchOrders = useCallback(async (initialLoad = false) => {
        if (initialLoad) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        setError('');

        try {
            const response = await apiCall<ApiOrder[]>('/orders');

            setOrders(Array.isArray(response) ? response : []);
            setLastUpdated(new Date());
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load workspace activity. Please try again.',
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Read state is stored separately for each selected workspace.
    useEffect(() => {
        const tenantId =
            window.localStorage.getItem('selectedTenantId') || 'default';

        const key = `pulsehive.notifications.read.${tenantId}`;

        setReadStorageKey(key);

        try {
            const stored = window.localStorage.getItem(key);

            if (stored) {
                const parsed: unknown = JSON.parse(stored);

                if (Array.isArray(parsed)) {
                    setReadIds(
                        parsed.filter(
                            (value): value is string =>
                                typeof value === 'string',
                        ),
                    );
                }
            }
        } catch {
            // Malformed browser storage must not prevent notifications from loading.
        } finally {
            setReadStateLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!readStateLoaded || !readStorageKey) {
            return;
        }

        try {
            window.localStorage.setItem(
                readStorageKey,
                JSON.stringify(readIds),
            );
        } catch {
            // Keep the notification page usable if browser storage is unavailable.
        }
    }, [readIds, readStateLoaded, readStorageKey]);

    useEffect(() => {
        if (isChecking || !isAuthenticated) {
            return;
        }

        void fetchOrders(true);

        const refreshTimer = window.setInterval(
            () => void fetchOrders(),
            REFRESH_INTERVAL_MS,
        );

        return () => {
            window.clearInterval(refreshTimer);
        };
    }, [fetchOrders, isAuthenticated, isChecking]);

    const notifications = useMemo(
        () => buildNotifications(orders),
        [orders],
    );

    const readSet = useMemo(
        () => new Set(readIds),
        [readIds],
    );

    const unreadCount = notifications.filter(
        (item) => !readSet.has(item.id),
    ).length;

    const filteredNotifications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return notifications.filter((item) => {
            const matchesCategory =
                categoryFilter === 'ALL' ||
                item.category === categoryFilter;

            const matchesReadState =
                !unreadOnly || !readSet.has(item.id);

            const searchable = [
                item.title,
                item.description,
                item.orderReference,
                categoryLabel(item.category),
            ]
                .join(' ')
                .toLowerCase();

            const matchesSearch =
                !query || searchable.includes(query);

            return (
                matchesCategory &&
                matchesReadState &&
                matchesSearch
            );
        });
    }, [
        notifications,
        categoryFilter,
        unreadOnly,
        readSet,
        search,
    ]);

    function markAsRead(id: string) {
        setReadIds((current) =>
            current.includes(id)
                ? current
                : [...current, id],
        );
    }

    function markAllAsRead() {
        setReadIds((current) =>
            Array.from(
                new Set([
                    ...current,
                    ...notifications.map((item) => item.id),
                ]),
            ),
        );
    }

    function resetFilters() {
        setSearch('');
        setCategoryFilter('ALL');
        setUnreadOnly(false);
    }

    if (isChecking || !isAuthenticated) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-sm text-slate-400">
                    Checking your workspace session...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col justify-between gap-5 border-b border-white/6 pb-6 xl:flex-row xl:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                            Account / Notifications
                        </p>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white">
                        Notifications
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Keep track of important order, payment and fulfilment activity.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                error
                                    ? 'bg-rose-400'
                                    : refreshing
                                        ? 'animate-pulse bg-amber-400'
                                        : 'bg-emerald-400'
                            }`}
                        />
                        {error
                            ? 'Connection issue'
                            : refreshing
                                ? 'Refreshing'
                                : 'Activity feed active'}
                    </span>

                    <button
                        type="button"
                        onClick={() => void fetchOrders()}
                        disabled={refreshing || loading}
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {refreshing ? 'Refreshing…' : '↻ Refresh'}
                    </button>

                    <button
                        type="button"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Mark all as read
                    </button>
                </div>
            </header>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-400/20 bg-rose-500/[0.06] p-4"
                >
                    <p className="text-xs font-semibold text-rose-300">
                        Unable to refresh notifications
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => void fetchOrders(true)}
                        className="mt-3 text-xs font-bold text-rose-300 hover:text-rose-200"
                    >
                        Try again →
                    </button>
                </div>
            )}

            <section className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                    label="Activity records"
                    value={notifications.length.toLocaleString('en-ZA')}
                    description="Most recent activity signals"
                />

                <SummaryCard
                    label="Unread"
                    value={unreadCount.toLocaleString('en-ZA')}
                    description="Items not yet marked as read"
                />

                <SummaryCard
                    label="Last refreshed"
                    value={lastUpdated
                        ? lastUpdated.toLocaleTimeString('en-ZA', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })
                        : '—'}
                    description={lastUpdated
                        ? lastUpdated.toLocaleDateString('en-ZA')
                        : 'Not yet synchronised'}
                />
            </section>

            <section className="ph-glass-panel space-y-4 p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Activity feed
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Search and filter recent workspace events.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={resetFilters}
                        disabled={
                            !search &&
                            categoryFilter === 'ALL' &&
                            !unreadOnly
                        }
                        className="self-start text-xs font-semibold text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
                    >
                        Reset filters
                    </button>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search activity or order reference..."
                        aria-label="Search notifications"
                        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50"
                    />

                    <button
                        type="button"
                        onClick={() => setUnreadOnly((current) => !current)}
                        aria-pressed={unreadOnly}
                        className={`rounded-lg border px-4 py-2.5 text-xs font-semibold transition ${
                            unreadOnly
                                ? 'border-indigo-400/30 bg-indigo-400/10 text-indigo-200'
                                : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                        }`}
                    >
                        {unreadOnly ? 'Showing unread' : 'Unread only'}
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-white/6 pt-4">
                    {([
                        { value: 'ALL', label: 'All activity' },
                        { value: 'ORDER', label: 'Orders' },
                        { value: 'PAYMENT', label: 'Payments' },
                        { value: 'FULFILMENT', label: 'Fulfilment' },
                    ] as {
                        value: CategoryFilter;
                        label: string;
                    }[]).map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setCategoryFilter(option.value)}
                            aria-pressed={categoryFilter === option.value}
                            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                categoryFilter === option.value
                                    ? 'border-indigo-400/40 bg-indigo-400/10 text-indigo-200'
                                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="ph-glass-panel overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-white/6 px-5 py-4">
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Recent activity
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {filteredNotifications.length} of {notifications.length} records
                        </p>
                    </div>

                    <span className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-mono text-slate-500">
                        Latest {MAX_NOTIFICATIONS}
                    </span>
                </div>

                {loading && notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-sm font-semibold text-white">
                            Loading workspace activity
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            Retrieving order and payment records...
                        </p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-xl text-slate-500">
                            ✓
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-white">
                            {notifications.length === 0
                                ? 'No activity yet'
                                : 'No matching notifications'}
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-500">
                            {notifications.length === 0
                                ? 'New orders, payment updates and fulfilment events will appear here when they are recorded.'
                                : 'Try changing your search or filters to find other activity.'}
                        </p>

                        {notifications.length > 0 && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-4 text-xs font-bold text-indigo-300 hover:text-indigo-200"
                            >
                                Clear filters →
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredNotifications.map((item) => {
                            const isRead = readSet.has(item.id);

                            return (
                                <article
                                    key={item.id}
                                    className={`flex flex-col gap-4 px-5 py-5 transition-colors sm:flex-row sm:items-start sm:justify-between ${
                                        isRead
                                            ? 'bg-transparent'
                                            : 'bg-indigo-500/[0.025]'
                                    }`}
                                >
                                    <div className="flex min-w-0 gap-3">
                                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black ${
                                            severityClasses(item.severity)
                                        }`}>
                                            {item.category === 'ORDER'
                                                ? 'O'
                                                : item.category === 'PAYMENT'
                                                    ? '₿'
                                                    : 'F'}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className={`text-xs font-bold ${
                                                    isRead
                                                        ? 'text-slate-300'
                                                        : 'text-white'
                                                }`}>
                                                    {item.title}
                                                </h3>

                                                <span className="rounded-md border border-white/8 bg-white/[0.025] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                                                    {categoryLabel(item.category)}
                                                </span>

                                                {!isRead && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                                )}
                                            </div>

                                            <p className="mt-2 text-xs leading-6 text-slate-400">
                                                {item.description}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
                                                <time
                                                    dateTime={item.occurredAt}
                                                    title={formatDate(item.occurredAt)}
                                                >
                                                    {formatRelativeTime(item.occurredAt)}
                                                </time>

                                                <span>
                                                    Order {item.orderReference}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3 pl-12 sm:pl-0">
                                        <Link
                                            href="/orders"
                                            className="text-[11px] font-bold text-indigo-300 transition hover:text-indigo-200"
                                        >
                                            View orders →
                                        </Link>

                                        {isRead ? (
                                            <span className="text-[10px] font-semibold text-slate-600">
                                                Read
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => markAsRead(item.id)}
                                                className="text-[10px] font-semibold text-slate-400 transition hover:text-white"
                                            >
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    About this activity feed
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                    Activity is derived from the order, payment and
                    fulfilment records available to your selected workspace.
                    Read status is stored in this browser for this workspace.
                    This MVP does not yet deliver email or push notifications,
                    and read status is not synchronised across devices.
                </p>
            </section>
        </div>
    );
}