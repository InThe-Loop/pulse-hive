'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiCall } from '@/lib/api-client';
import OrderDetailsDrawer, { StatusPill } from './components/OrderDetailsDrawer';
import type { ApiOrder, ApiOrderFulfilment, DateRange, FulfilmentStatus, Order, SortOrder } from './lib/orders.types';
import { downloadCsv, formatDate, isWithinDateRange, mapOrder, money, paymentReference, latestPayment, statusLabel } from './lib/orders.utils';

type OrdersView = 'ALL' | 'NEEDS_ATTENTION' | 'AWAITING_FULFILMENT' | 'READY_FOR_DISPATCH';
type FulfilmentFilter = 'ALL' | FulfilmentStatus;

type OrdersFilters = {
    search: string;
    paymentFilter: string;
    statusFilter: string;
    fulfilmentFilter: FulfilmentFilter;
    ordersView: OrdersView;
    dateRange: DateRange;
    sortOrder: SortOrder;
};

type SavedOrdersView = {
    id: string;
    name: string;
    filters: OrdersFilters;
};

const SAVED_VIEWS_STORAGE_KEY = 'pulsehive.orders.saved-views.v1';

const ALLOWED_FULFILMENT_TRANSITIONS: Record<FulfilmentStatus, FulfilmentStatus[]> = {
    NOT_STARTED: ['PROCESSING', 'ON_HOLD'],
    PROCESSING: ['PACKED', 'ON_HOLD'],
    PACKED: ['READY_FOR_DISPATCH', 'ON_HOLD'],
    READY_FOR_DISPATCH: ['DISPATCHED', 'ON_HOLD'],
    DISPATCHED: ['DELIVERED', 'DELIVERY_FAILED', 'ON_HOLD'],
    ON_HOLD: ['PROCESSING'],
    DELIVERY_FAILED: ['PROCESSING'],
    DELIVERED: [],
};

const FULFILMENT_STAGES: FulfilmentStatus[] = [
    'PROCESSING',
    'PACKED',
    'READY_FOR_DISPATCH',
    'DISPATCHED',
    'DELIVERED',
];

function fulfilmentStatus(order: Order): FulfilmentStatus {
    return order.fulfilment?.status ?? 'NOT_STARTED';
}

function isNeedsAttention(order: Order): boolean {
    const status = fulfilmentStatus(order);
    return order.paymentStatus === 'FLAGGED' || status === 'ON_HOLD' || status === 'DELIVERY_FAILED';
}

function isAwaitingFulfilment(order: Order): boolean {
    return order.paymentStatus === 'PAID' && fulfilmentStatus(order) === 'NOT_STARTED';
}

function fulfilmentStageTime(order: Order): number {
    const fulfilment = order.fulfilment;
    if (!fulfilment) return new Date(order.createdAt).getTime();

    const status = fulfilment.status;
    const matchingHistory = (fulfilment.history ?? [])
        .filter((entry) => entry.newStatus === status && entry.previousStatus !== entry.newStatus)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const stageTimestamp: string | null | undefined = {
        PROCESSING: fulfilment.startedAt,
        PACKED: fulfilment.packedAt,
        READY_FOR_DISPATCH: fulfilment.readyForDispatchAt,
        DISPATCHED: fulfilment.dispatchedAt,
        DELIVERED: fulfilment.deliveredAt,
    }[status as 'PROCESSING' | 'PACKED' | 'READY_FOR_DISPATCH' | 'DISPATCHED' | 'DELIVERED'];

    const value = matchingHistory?.createdAt ?? stageTimestamp ?? fulfilment.createdAt;
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : new Date(order.createdAt).getTime();
}

function formatElapsedSince(value: number, now: number): string {
    if (!Number.isFinite(value)) return 'Age unavailable';

    const elapsedMinutes = Math.max(0, Math.floor((now - value) / 60_000));

    if (elapsedMinutes < 1) return 'Just now';
    if (elapsedMinutes < 60) return `${elapsedMinutes}m`;

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
        const remainingMinutes = elapsedMinutes % 60;
        return remainingMinutes > 0
            ? `${elapsedHours}h ${remainingMinutes}m`
            : `${elapsedHours}h`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);
    const remainingHours = elapsedHours % 24;
    return remainingHours > 0
        ? `${elapsedDays}d ${remainingHours}h`
        : `${elapsedDays}d`;
}

function fulfilmentTone(status: FulfilmentStatus): string {
    switch (status) {
        case 'DELIVERED':
            return 'text-emerald-300';
        case 'ON_HOLD':
            return 'text-amber-300';
        case 'DELIVERY_FAILED':
            return 'text-rose-300';
        case 'DISPATCHED':
        case 'READY_FOR_DISPATCH':
        case 'PACKED':
        case 'PROCESSING':
            return 'text-indigo-300';
        case 'NOT_STARTED':
        default:
            return 'text-slate-400';
    }
}

function FulfilmentCell({ order, now }: { order: Order; now: number }) {
    const status = fulfilmentStatus(order);
    const stageStartedAt = fulfilmentStageTime(order);
    const stageAge = formatElapsedSince(stageStartedAt, now);
    const currentIndex = FULFILMENT_STAGES.indexOf(status);
    const isException = status === 'ON_HOLD' || status === 'DELIVERY_FAILED';
    const previousStatus = order.fulfilment?.history?.find((entry) => entry.newStatus === status)?.previousStatus;
    const previousStageIndex = previousStatus ? FULFILMENT_STAGES.indexOf(previousStatus) : -1;
    const progress = isException
        ? previousStageIndex + 1
        : currentIndex + 1;

    return (
        <div className="min-w-36.25 max-w-43.75 space-y-2" title={`Fulfilment: ${statusLabel(status)}`}>
            <div className="flex items-center gap-2">
                <span className={`block min-w-0 truncate text-xs font-semibold ${fulfilmentTone(status)}`}>
                    {statusLabel(status)}
                </span>
                {isException && (
                    <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wide ${status === 'DELIVERY_FAILED' ? 'text-rose-300' : 'text-amber-300'}`}>
                        Attention
                    </span>
                )}
            </div>
            <div className="flex gap-1" aria-label={`${Math.max(progress, 0)} of ${FULFILMENT_STAGES.length} fulfilment stages reached`}>
                {FULFILMENT_STAGES.map((stage, index) => (
                    <span
                        key={stage}
                        className={`h-1 flex-1 rounded-full ${
                            index < progress
                                ? isException
                                    ? 'bg-amber-400/80'
                                    : status === 'DELIVERED'
                                      ? 'bg-emerald-400'
                                      : 'bg-indigo-400'
                                : 'bg-white/10'
                        }`}
                    />
                ))}
            </div>
            <p className="text-[10px] text-slate-500" title={`In ${statusLabel(status)} for ${stageAge}`}>
                <span className="text-slate-600">In stage</span>{' '}
                <span className={isException ? fulfilmentTone(status) : 'text-slate-400'}>
                    {stageAge}
                </span>
            </p>
            {(order.fulfilment?.deliveryProvider || order.fulfilment?.trackingReference) && (
                <div className="space-y-0.5">
                    {order.fulfilment?.deliveryProvider && (
                        <p className="truncate text-[10px] text-slate-500" title={order.fulfilment.deliveryProvider}>
                            {order.fulfilment.deliveryProvider}
                        </p>
                    )}
                    {order.fulfilment?.trackingReference && (
                        <p className="truncate font-mono text-[10px] text-slate-500" title={order.fulfilment.trackingReference}>
                            {order.fulfilment.trackingReference}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [fulfilmentFilter, setFulfilmentFilter] = useState<FulfilmentFilter>('ALL');
    const [ordersView, setOrdersView] = useState<OrdersView>('ALL');
    const [dateRange, setDateRange] = useState<DateRange>('ALL');
    const [sortOrder, setSortOrder] = useState<SortOrder>('NEWEST');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [bulkTargetStatus, setBulkTargetStatus] = useState<FulfilmentStatus | ''>('');
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [bulkMessage, setBulkMessage] = useState('');
    const [savedViews, setSavedViews] = useState<SavedOrdersView[]>([]);
    const [selectedSavedViewId, setSelectedSavedViewId] = useState('');
    const [savedViewsLoaded, setSavedViewsLoaded] = useState(false);
    const [savedViewName, setSavedViewName] = useState('');
    const [isSavingView, setIsSavingView] = useState(false);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(SAVED_VIEWS_STORAGE_KEY);
            if (stored) {
                const parsed: unknown = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setSavedViews(parsed.filter((item): item is SavedOrdersView =>
                        Boolean(item) &&
                        typeof item.id === 'string' &&
                        typeof item.name === 'string' &&
                        item.filters &&
                        typeof item.filters === 'object',
                    ).slice(0, 10));
                }
            }
        } catch {
            // Saved views are a convenience; malformed or blocked storage must not block Orders.
        } finally {
            setSavedViewsLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!savedViewsLoaded) return;
        try {
            window.localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(savedViews));
        } catch {
            // Keep the current session usable if browser storage is unavailable.
        }
    }, [savedViews, savedViewsLoaded]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNow(Date.now());
        }, 60_000);

        return () => window.clearInterval(intervalId);
    }, []);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await apiCall<ApiOrder[]>('/orders');
            setOrders(response.map(mapOrder));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load orders. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        const query = search.trim().toLowerCase();

        const result = orders.filter((order) => {
            const paymentSearch = order.payments
                .map((payment) =>
                    [
                        payment.provider,
                        payment.providerReference,
                        payment.transactionReference,
                        payment.paymentRequestId,
                        payment.providerStatusMessage,
                    ].join(' '),
                )
                .join(' ');

            const itemSearch = order.items
                .map((item) =>
                    [
                        item.productName,
                        item.sku,
                        item.quantity,
                    ].join(' '),
                )
                .join(' ');

            const searchable = [
                order.reference,
                order.id,
                order.customerName,
                order.contactNumber,
                order.email,
                order.customerAddress,
                order.deliveryAddress,
                order.itemsSummary,
                itemSearch,
                paymentSearch,
                order.trackingNumber,
                order.fulfilment?.status,
                order.fulfilment ? statusLabel(order.fulfilment.status) : 'Not started',
                order.fulfilment?.deliveryProvider,
                order.fulfilment?.trackingReference,
                order.fulfilment?.operationalNotes,
            ]
                .join(' ')
                .toLowerCase();

            const matchesSearch =
                !query || searchable.includes(query);

            const matchesPayment =
                paymentFilter === 'ALL' ||
                order.paymentStatus === paymentFilter;

            const matchesStatus =
                statusFilter === 'ALL' ||
                order.status === statusFilter;

            const matchesFulfilment =
                fulfilmentFilter === 'ALL' || fulfilmentStatus(order) === fulfilmentFilter;

            const matchesView =
                ordersView === 'ALL' ||
                (ordersView === 'NEEDS_ATTENTION' && isNeedsAttention(order)) ||
                (ordersView === 'AWAITING_FULFILMENT' && isAwaitingFulfilment(order)) ||
                (ordersView === 'READY_FOR_DISPATCH' && fulfilmentStatus(order) === 'READY_FOR_DISPATCH');

            const matchesDate = isWithinDateRange(order.createdAt, dateRange);

            return (
                matchesSearch &&
                matchesPayment &&
                matchesStatus &&
                matchesFulfilment &&
                matchesView &&
                matchesDate
            );
        });

        return result.sort((a, b) => {
            switch (sortOrder) {
                case 'OLDEST':
                    return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    );

                case 'STAGE_OLDEST':
                    return fulfilmentStageTime(a) - fulfilmentStageTime(b);

                case 'UPDATED':
                    return new Date(b.fulfilment?.updatedAt ?? b.updatedAt ?? b.createdAt).getTime() -
                        new Date(a.fulfilment?.updatedAt ?? a.updatedAt ?? a.createdAt).getTime();

                case 'HIGHEST':
                    return b.totalAmount - a.totalAmount;

                case 'LOWEST':
                    return a.totalAmount - b.totalAmount;

                case 'NEWEST':
                default:
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
            }
        });
    }, [
        orders,
        search,
        paymentFilter,
        statusFilter,
        fulfilmentFilter,
        ordersView,
        dateRange,
        sortOrder,
    ]);

    const hasActiveFilters =
        search.trim() !== '' ||
        paymentFilter !== 'ALL' ||
        statusFilter !== 'ALL' ||
        fulfilmentFilter !== 'ALL' ||
        ordersView !== 'ALL' ||
        dateRange !== 'ALL' ||
        sortOrder !== 'NEWEST';

    const resetFilters = () => {
        setSearch('');
        setPaymentFilter('ALL');
        setStatusFilter('ALL');
        setFulfilmentFilter('ALL');
        setOrdersView('ALL');
        setDateRange('ALL');
        setSortOrder('NEWEST');
    };

    const currentFilters: OrdersFilters = {
        search,
        paymentFilter,
        statusFilter,
        fulfilmentFilter,
        ordersView,
        dateRange,
        sortOrder,
    };

    const selectedOrders = orders.filter((order) => selectedOrderIds.includes(order.id));
    const selectedVisibleCount = filteredOrders.filter((order) => selectedOrderIds.includes(order.id)).length;
    const allVisibleSelected = filteredOrders.length > 0 && selectedVisibleCount === filteredOrders.length;
    const eligibleBulkOrders = selectedOrders.filter((order) =>
        !order.isLocalDraft &&
        Boolean(bulkTargetStatus) &&
        ALLOWED_FULFILMENT_TRANSITIONS[fulfilmentStatus(order)].includes(bulkTargetStatus as FulfilmentStatus),
    );

    const saveCurrentView = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const name = savedViewName.trim();
        if (!name) return;

        const existing = savedViews.find((view) => view.name.toLowerCase() === name.toLowerCase());
        if (!existing && savedViews.length >= 10) {
            setBulkMessage('You can save up to 10 views. Delete one before adding another.');
            return;
        }

        const view: SavedOrdersView = {
            id: existing?.id ?? `view-${Date.now()}`,
            name,
            filters: { ...currentFilters },
        };
        setSavedViews((current) => existing
            ? current.map((item) => item.id === existing.id ? view : item)
            : [...current, view]);
        setSavedViewName('');
        setIsSavingView(false);
        setSelectedSavedViewId(view.id);
        setBulkMessage(`Saved view “${name}”.`);
    };

    const applySavedView = (viewId: string) => {
        const view = savedViews.find((item) => item.id === viewId);
        if (!view) return;
        setSelectedSavedViewId(view.id);
        setSearch(view.filters.search ?? '');
        setPaymentFilter(view.filters.paymentFilter ?? 'ALL');
        setStatusFilter(view.filters.statusFilter ?? 'ALL');
        setFulfilmentFilter(view.filters.fulfilmentFilter ?? 'ALL');
        setOrdersView(view.filters.ordersView ?? 'ALL');
        setDateRange(view.filters.dateRange ?? 'ALL');
        setSortOrder(view.filters.sortOrder ?? 'NEWEST');
        setBulkMessage(`Applied view “${view.name}”.`);
    };

    const toggleOrderSelection = (orderId: string, checked: boolean) => {
        setSelectedOrderIds((current) => checked
            ? current.includes(orderId) ? current : [...current, orderId]
            : current.filter((id) => id !== orderId));
    };

    const toggleVisibleSelection = () => {
        const visibleIds = filteredOrders.map((order) => order.id);
        if (allVisibleSelected) {
            setSelectedOrderIds((current) => current.filter((id) => !visibleIds.includes(id)));
        } else {
            setSelectedOrderIds((current) => [...new Set([...current, ...visibleIds])]);
        }
    };

    const runBulkFulfilmentUpdate = async () => {
        if (!bulkTargetStatus || eligibleBulkOrders.length === 0 || isBulkUpdating) return;

        setIsBulkUpdating(true);
        setBulkMessage('');
        const succeeded: { id: string; fulfilment: ApiOrderFulfilment }[] = [];
        const failed: string[] = [];

        for (const order of eligibleBulkOrders) {
            try {
                const current = order.fulfilment;
                const updated = await apiCall<ApiOrderFulfilment>(
                    `/orders/${encodeURIComponent(order.id)}/fulfilment`,
                    {
                        method: 'PATCH',
                        body: JSON.stringify({
                            status: bulkTargetStatus,
                            deliveryProvider: current?.deliveryProvider ?? '',
                            trackingReference: current?.trackingReference ?? '',
                            operationalNotes: current?.operationalNotes ?? '',
                        }),
                    },
                );
                succeeded.push({ id: order.id, fulfilment: updated });
            } catch {
                failed.push(order.reference);
            }
        }

        if (succeeded.length) {
            const updatedById = new Map(succeeded.map((item) => [item.id, item.fulfilment]));
            setOrders((current) => current.map((order) => {
                const fulfilment = updatedById.get(order.id);
                return fulfilment ? { ...order, fulfilment } : order;
            }));
            setSelectedOrder((current) => {
                if (!current) return current;
                const fulfilment = updatedById.get(current.id);
                return fulfilment ? { ...current, fulfilment } : current;
            });
            setSelectedOrderIds((current) => current.filter((id) => !updatedById.has(id)));
        }

        const skipped = selectedOrders.length - eligibleBulkOrders.length;
        const parts = [`Updated ${succeeded.length} order${succeeded.length === 1 ? '' : 's'}.`];
        if (skipped > 0) parts.push(`${skipped} selected order${skipped === 1 ? '' : 's'} skipped because this transition is not allowed or the order is a local draft.`);
        if (failed.length) parts.push(`Failed: ${failed.join(', ')}.`);
        setBulkMessage(parts.join(' '));
        setIsBulkUpdating(false);
    };

    const totalOrderValue = orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
    );

    const awaitingPayment = orders.filter(
        (order) => order.paymentStatus === 'PENDING',
    ).length;

    const flaggedPayments = orders.filter(
        (order) => order.paymentStatus === 'FLAGGED',
    ).length;

    const paidOrders = orders.filter(
        (order) => order.paymentStatus === 'PAID',
    ).length;

    return (
        <div className="space-y-10">
            <header className="flex flex-col justify-between gap-5 border-b border-white/6 pb-6 xl:flex-row xl:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                            Operations / Orders
                        </p>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white">
                        Customer Orders
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Track payments, inspect orders, and manage customer deliveries.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/2 px-4 py-2 text-xs font-semibold text-slate-300">
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                error
                                    ? 'bg-rose-400'
                                    : isLoading
                                      ? 'animate-pulse bg-amber-400'
                                      : 'bg-emerald-400'
                            }`}
                        />
                        {error ? 'Connection issue' : isLoading ? 'Syncing...' : 'Connected'}
                    </span>

                    <button
                        type="button"
                        onClick={() => void fetchOrders()}
                        disabled={isLoading}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                    >
                        {isLoading ? 'Refreshing...' : '↻ Refresh'}
                    </button>

                </div>
            </header>

            {error && (
                <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-4">
                    <p className="text-sm font-semibold text-rose-300">
                        Orders could not be loaded
                    </p>
                    <p className="mt-1 wrap-break-word text-xs text-rose-200/80">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => void fetchOrders()}
                        className="mt-3 text-xs font-bold text-rose-200 underline underline-offset-4"
                    >
                        Try again
                    </button>
                </div>
            )}

            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: 'Total Orders',
                        value: orders.length.toLocaleString('en-ZA'),
                        note: 'All loaded orders',
                        color: 'text-white',
                    },
                    {
                        label: 'Awaiting Payment',
                        value: awaitingPayment.toLocaleString('en-ZA'),
                        note: 'Payment pending',
                        color: 'text-amber-300',
                    },
                    {
                        label: 'Payments Flagged',
                        value: flaggedPayments.toLocaleString('en-ZA'),
                        note: 'Review required',
                        color: 'text-rose-300',
                    },
                    {
                        label: 'Total Order Value',
                        value: money(totalOrderValue),
                        note: `${paidOrders} paid orders`,
                        color: 'text-indigo-300',
                    },
                ].map((metric) => (
                    <div
                        key={metric.label}
                        className="ph-glass-panel min-w-0 p-5"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            {metric.label}
                        </p>
                        <p
                            className={`mt-3 wrap-break-word font-mono text-2xl font-black tracking-tight ${metric.color}`}
                        >
                            {metric.value}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            {metric.note}
                        </p>
                    </div>
                ))}
            </section>

            <section className="ph-glass-panel space-y-4 p-5">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-sm font-bold text-white">Fulfilment workload</h2>
                        <p className="mt-1 text-xs text-slate-500">Live counts across all loaded workspace orders.</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-600">Operational snapshot</span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {[
                        { label: 'Not started', count: orders.filter((order) => fulfilmentStatus(order) === 'NOT_STARTED').length, tone: 'text-slate-300' },
                        { label: 'In progress', count: orders.filter((order) => ['PROCESSING', 'PACKED'].includes(fulfilmentStatus(order))).length, tone: 'text-indigo-300' },
                        { label: 'Ready to dispatch', count: orders.filter((order) => fulfilmentStatus(order) === 'READY_FOR_DISPATCH').length, tone: 'text-indigo-200' },
                        { label: 'In transit', count: orders.filter((order) => fulfilmentStatus(order) === 'DISPATCHED').length, tone: 'text-sky-300' },
                        { label: 'Exceptions', count: orders.filter((order) => ['ON_HOLD', 'DELIVERY_FAILED'].includes(fulfilmentStatus(order))).length, tone: 'text-rose-300' },
                        { label: 'Delivered', count: orders.filter((order) => fulfilmentStatus(order) === 'DELIVERED').length, tone: 'text-emerald-300' },
                    ].map((metric) => (
                        <div key={metric.label} className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
                            <p className={`mt-2 font-mono text-xl font-bold ${metric.tone}`}>{metric.count}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ph-glass-panel space-y-5 p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Find an order
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Search orders, customers, payment references, fulfilment stages, carriers, and tracking numbers.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => downloadCsv(filteredOrders)}
                        disabled={filteredOrders.length === 0}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ↓ Export CSV ({filteredOrders.length})
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
                    <div className="relative xl:col-span-2">
                        <label
                            htmlFor="order-search"
                            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            Search
                        </label>
                        <input
                            id="order-search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Order, customer, SKU, fulfilment, tracking…"
                            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="payment-filter"
                            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            Payment
                        </label>
                        <select
                            id="payment-filter"
                            value={paymentFilter}
                            onChange={(event) => setPaymentFilter(event.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-400/50"
                        >
                            <option value="ALL">All payments</option>
                            <option value="PAID">Paid</option>
                            <option value="PENDING">Pending</option>
                            <option value="PARTIAL">Partially paid</option>
                            <option value="FLAGGED">Needs attention</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="order-status-filter"
                            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            Order status
                        </label>
                        <select
                            id="order-status-filter"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-400/50"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="PENDING_PAYMENT">Pending payment</option>
                            <option value="PAID">Paid</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="READY_TO_SHIP">Ready to ship</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="fulfilment-filter"
                            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            Fulfilment
                        </label>
                        <select
                            id="fulfilment-filter"
                            value={fulfilmentFilter}
                            onChange={(event) => setFulfilmentFilter(event.target.value as FulfilmentFilter)}
                            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-400/50"
                        >
                            <option value="ALL">All fulfilment</option>
                            <option value="NOT_STARTED">Not started</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="PACKED">Packed</option>
                            <option value="READY_FOR_DISPATCH">Ready for dispatch</option>
                            <option value="DISPATCHED">Dispatched</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="ON_HOLD">On hold</option>
                            <option value="DELIVERY_FAILED">Delivery failed</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="date-filter"
                            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            Created
                        </label>
                        <select
                            id="date-filter"
                            value={dateRange}
                            onChange={(event) =>
                                setDateRange(event.target.value as DateRange)
                            }
                            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-400/50"
                        >
                            <option value="ALL">All time</option>
                            <option value="TODAY">Today</option>
                            <option value="7D">Last 7 days</option>
                            <option value="30D">Last 30 days</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/6 pt-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <label htmlFor="saved-orders-view" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Saved views</label>
                        <div className="flex flex-wrap gap-2">
                            <select
                                id="saved-orders-view"
                                value={selectedSavedViewId}
                                onChange={(event) => applySavedView(event.target.value)}
                                className="min-w-[190px] rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-400/50"
                            >
                                <option value="">Load a saved view…</option>
                                {savedViews.map((view) => <option key={view.id} value={view.id}>{view.name}</option>)}
                            </select>
                            {selectedSavedViewId && (
                                <button type="button" onClick={() => {
                                    const target = savedViews.find((view) => view.id === selectedSavedViewId);
                                    setSavedViews((current) => current.filter((view) => view.id !== selectedSavedViewId));
                                    setSelectedSavedViewId('');
                                    if (target) setBulkMessage(`Deleted saved view “${target.name}”.`);
                                }} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
                                    Delete view
                                </button>
                            )}
                            <button type="button" onClick={() => setIsSavingView((current) => !current)} className="rounded-lg border border-indigo-400/20 bg-indigo-400/5 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-400/10">
                                Save current filters
                            </button>
                        </div>
                        {isSavingView && (
                            <form onSubmit={saveCurrentView} className="mt-3 flex flex-wrap gap-2">
                                <input value={savedViewName} onChange={(event) => setSavedViewName(event.target.value)} maxLength={40} required placeholder="Name this view" aria-label="Saved view name" className="min-w-[190px] rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/50" />
                                <button type="submit" className="rounded-lg bg-indigo-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-indigo-300">Save view</button>
                                <button type="button" onClick={() => { setIsSavingView(false); setSavedViewName(''); }} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">Cancel</button>
                            </form>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-600">Saved in this browser · up to 10 views</p>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-white/6 pt-4">
                    {([
                        { value: 'ALL', label: 'All orders', count: orders.length },
                        { value: 'NEEDS_ATTENTION', label: 'Needs attention', count: orders.filter(isNeedsAttention).length },
                        { value: 'AWAITING_FULFILMENT', label: 'Awaiting fulfilment', count: orders.filter(isAwaitingFulfilment).length },
                        { value: 'READY_FOR_DISPATCH', label: 'Ready for dispatch', count: orders.filter((order) => fulfilmentStatus(order) === 'READY_FOR_DISPATCH').length },
                    ] as { value: OrdersView; label: string; count: number }[]).map((view) => (
                        <button
                            key={view.value}
                            type="button"
                            onClick={() => setOrdersView(view.value)}
                            aria-pressed={ordersView === view.value}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                ordersView === view.value
                                    ? 'border-indigo-400/40 bg-indigo-400/10 text-indigo-200'
                                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                            }`}
                        >
                            {view.label}
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${ordersView === view.value ? 'bg-indigo-400/15 text-indigo-200' : 'bg-white/5 text-slate-500'}`}>
                                {view.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex flex-col justify-between gap-3 border-t border-white/6 pt-4 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono font-bold text-white">
                            {filteredOrders.length}
                        </span>
                        of {orders.length} orders
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="ml-1 font-semibold text-indigo-300 transition hover:text-indigo-200"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="order-sort"
                            className="whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            Sort by
                        </label>
                        <select
                            id="order-sort"
                            value={sortOrder}
                            onChange={(event) =>
                                setSortOrder(event.target.value as SortOrder)
                            }
                            className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-400/50"
                        >
                            <option value="NEWEST">Newest first</option>
                            <option value="OLDEST">Oldest first</option>
                            <option value="HIGHEST">Highest value</option>
                            <option value="LOWEST">Lowest value</option>
                            <option value="STAGE_OLDEST">Longest in fulfilment stage</option>
                            <option value="UPDATED">Recently updated</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-white/6 pt-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span className="font-semibold text-white">{selectedOrderIds.length} selected</span>
                            <button type="button" onClick={() => setSelectedOrderIds([])} disabled={selectedOrderIds.length === 0 || isBulkUpdating} className="rounded-md border border-white/10 px-2.5 py-1.5 font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-40">Clear selection</button>
                            <button type="button" onClick={() => downloadCsv(selectedOrders)} disabled={selectedOrders.length === 0} className="rounded-md border border-white/10 px-2.5 py-1.5 font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-40">Export selected</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <label htmlFor="bulk-fulfilment-status" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bulk fulfilment</label>
                            <select id="bulk-fulfilment-status" value={bulkTargetStatus} onChange={(event) => setBulkTargetStatus(event.target.value as FulfilmentStatus | '')} disabled={isBulkUpdating} className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-400/50">
                                <option value="">Choose next status…</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="PACKED">Packed</option>
                                <option value="READY_FOR_DISPATCH">Ready for dispatch</option>
                                <option value="DISPATCHED">Dispatched</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="ON_HOLD">On hold</option>
                                <option value="DELIVERY_FAILED">Delivery failed</option>
                            </select>
                            <button type="button" onClick={() => void runBulkFulfilmentUpdate()} disabled={isBulkUpdating || eligibleBulkOrders.length === 0} className="rounded-lg bg-indigo-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-indigo-300 disabled:cursor-not-allowed disabled:opacity-40">
                                {isBulkUpdating ? 'Updating…' : `Apply to ${eligibleBulkOrders.length} eligible`}
                            </button>
                        </div>
                    </div>
                    {bulkTargetStatus && selectedOrderIds.length > 0 && (
                        <p className="mt-2 text-[10px] text-slate-500">Only selected orders with a valid next transition to {statusLabel(bulkTargetStatus)} will be updated. Other selected orders will be skipped.</p>
                    )}
                    {bulkMessage && <p role="status" className="mt-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-xs text-slate-300">{bulkMessage}</p>}
                </div>
            </section>

            <section className="ph-glass-panel overflow-hidden">
                <div className="flex flex-col justify-between gap-2 border-b border-white/6 px-5 py-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Order ledger
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Select an order reference to inspect its details.
                        </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {filteredOrders.length} results
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="ph-ledger-table w-full min-w-[1240px] text-left">
                        <thead className="border-b border-white/6 bg-white/1.5">
                            <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <th className="w-10 px-3 py-4">
                                    <input type="checkbox" aria-label="Select all filtered orders" checked={allVisibleSelected} onChange={toggleVisibleSelection} className="h-3.5 w-3.5 accent-indigo-400" />
                                </th>
                                <th className="w-[130px] px-3 py-4">Order</th>
                                <th className="px-5 py-4">Payment reference</th>
                                <th className="px-5 py-4">Customer</th>
                                <th className="px-5 py-4">Products</th>
                                <th className="px-5 py-4">Total due</th>
                                <th className="px-5 py-4">Payment</th>
                                <th className="px-5 py-4">Order status</th>
                                <th className="px-5 py-4">Fulfilment</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/4">
                            {isLoading && orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Loading orders…
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-5 py-16 text-center"
                                    >
                                        <p className="text-sm font-semibold text-slate-300">
                                            {orders.length === 0
                                                ? 'No orders found'
                                                : 'No orders match these filters'}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {orders.length === 0
                                                ? 'Orders will appear here when available in your workspace.'
                                                : 'Try changing your search or clearing the filters.'}
                                        </p>
                                        {orders.length > 0 && hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={resetFilters}
                                                className="mt-3 text-xs font-bold text-indigo-300 hover:text-indigo-200"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        tabIndex={0}
                                        aria-label={`Open order ${order.reference}`}
                                        onClick={() => setSelectedOrder(order)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                setSelectedOrder(order);
                                            }
                                        }}
                                        className="cursor-pointer transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400/70"
                                    >
                                        <td className="w-10 px-3 py-4" onClick={(event) => event.stopPropagation()}>
                                            <input type="checkbox" aria-label={`Select order ${order.reference}`} checked={selectedOrderIds.includes(order.id)} onChange={(event) => toggleOrderSelection(order.id, event.target.checked)} className="h-3.5 w-3.5 accent-indigo-400" />
                                        </td>
                                        <td className="w-[130px] max-w-[130px] px-3 py-4">
                                            <button
                                                type="button"
                                                title={order.reference}
                                                onClick={() => setSelectedOrder(order)}
                                                className="block max-w-full text-left"
                                            >
                                                <span className="block max-w-[110px] truncate font-mono text-xs font-bold text-indigo-300 transition hover:text-indigo-200">
                                                    {order.reference}
                                                </span>
                                                <span className="mt-1 block whitespace-nowrap text-[10px] text-slate-500">
                                                    {formatDate(order.createdAt)}
                                                </span>
                                            </button>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="block max-w-[180px] truncate font-mono text-[11px] text-slate-400">
                                                {paymentReference(order)}
                                            </span>
                                            {latestPayment(order)?.provider && (
                                                <span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-600">
                                                    {latestPayment(order)?.provider}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-xs font-semibold text-slate-200">
                                                {order.customerName}
                                            </p>
                                            <p className="mt-1 text-[10px] text-slate-500">
                                                {order.contactNumber || order.email || 'No contact details'}
                                            </p>
                                        </td>

                                        <td className="max-w-[220px] px-5 py-4">
                                            <p
                                                title={order.itemsSummary}
                                                className="line-clamp-2 text-xs text-slate-400"
                                            >
                                                {order.itemsSummary}
                                            </p>
                                            <p className="mt-1 text-[10px] text-slate-600">
                                                {order.items.length
                                                    ? `${order.items.length} line item${order.items.length === 1 ? '' : 's'}`
                                                    : 'Item details unavailable'}
                                            </p>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-bold text-white">
                                            {money(order.totalAmount)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusPill status={order.paymentStatus} />
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusPill status={order.status} />
                                        </td>

                                        <td className="px-5 py-4">
                                            <FulfilmentCell order={order} now={now} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col justify-between gap-2 border-t border-white/6 px-5 py-3 sm:flex-row sm:items-center">
                    <p className="text-[10px] text-slate-600">
                        Showing loaded workspace orders. Search and filters apply to this result set.
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                        {filteredOrders.length} displayed
                    </p>
                </div>
            </section>

            <OrderDetailsDrawer
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onFulfilmentUpdated={(orderId: string, fulfilment: ApiOrderFulfilment) => {
                    setOrders((current) =>
                        current.map((order) =>
                            order.id === orderId ? { ...order, fulfilment } : order,
                        ),
                    );
                    setSelectedOrder((current) =>
                        current?.id === orderId ? { ...current, fulfilment } : current,
                    );
                }}
            />

        </div>
    );
}
