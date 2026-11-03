'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { apiCall } from '@/lib/api-client';
import type {
    ApiFulfilmentHistoryEntry,
    ApiOrderFulfilment,
    FulfilmentStatus,
    Order,
} from '../lib/orders.types';
import { amountValue, formatDate, money, statusClasses, statusLabel } from '../lib/orders.utils';

type DrawerTab = 'overview' | 'delivery' | 'activity';

type CurrentUser = {
    id: string | null;
    name: string;
};

function getStringField(record: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    return null;
}

function resolveCurrentUser(profile: Record<string, unknown>): CurrentUser {
    const nested = profile.user ?? profile.profile ?? profile.data;
    const record = nested && typeof nested === 'object'
        ? nested as Record<string, unknown>
        : profile;
    const id = getStringField(record, ['id', 'userId', 'sub']);
    const displayName = getStringField(record, ['displayName', 'fullName', 'name']);
    const email = getStringField(record, ['email']);

    return {
        id,
        name: displayName || email?.split('@')[0] || 'You',
    };
}

const ALLOWED_NEXT_STATUSES: Record<FulfilmentStatus, FulfilmentStatus[]> = {
    NOT_STARTED: ['PROCESSING', 'ON_HOLD'],
    PROCESSING: ['PACKED', 'ON_HOLD'],
    PACKED: ['READY_FOR_DISPATCH', 'ON_HOLD'],
    READY_FOR_DISPATCH: ['DISPATCHED', 'ON_HOLD'],
    DISPATCHED: ['DELIVERED', 'DELIVERY_FAILED', 'ON_HOLD'],
    ON_HOLD: ['PROCESSING'],
    DELIVERY_FAILED: ['PROCESSING'],
    DELIVERED: [],
};

const PRIMARY_STATUS: Partial<Record<FulfilmentStatus, FulfilmentStatus>> = {
    NOT_STARTED: 'PROCESSING',
    PROCESSING: 'PACKED',
    PACKED: 'READY_FOR_DISPATCH',
    READY_FOR_DISPATCH: 'DISPATCHED',
    DISPATCHED: 'DELIVERED',
    ON_HOLD: 'PROCESSING',
    DELIVERY_FAILED: 'PROCESSING',
};

const STATUS_STEPS: FulfilmentStatus[] = [
    'PROCESSING',
    'PACKED',
    'READY_FOR_DISPATCH',
    'DISPATCHED',
    'DELIVERED',
];

function inputClassName() {
    return 'w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/70 disabled:cursor-not-allowed disabled:opacity-50';
}

export function Field({
    label,
    value,
    mono = false,
}: {
    label: string;
    value?: string | number | null;
    mono?: boolean;
}) {
    return (
        <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </p>
            <p className={`break-words text-sm text-slate-200 ${mono ? 'font-mono' : ''}`}>
                {value === undefined || value === null || value === '' ? '—' : value}
            </p>
        </div>
    );
}

export function StatusPill({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${statusClasses(status)}`}
        >
            {statusLabel(status)}
        </span>
    );
}

function SectionTitle({ children }: { children: ReactNode }) {
    return <h3 className="text-sm font-semibold text-white">{children}</h3>;
}

function EmptyState({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs leading-5 text-slate-500">
            {children}
        </div>
    );
}

function FulfilmentProgress({ status }: { status: FulfilmentStatus }) {
    const currentIndex = STATUS_STEPS.indexOf(status);
    const isExceptional = status === 'ON_HOLD' || status === 'DELIVERY_FAILED';
    const completedIndex = status === 'NOT_STARTED' ? -1 : currentIndex;

    return (
        <div className="space-y-2" aria-label={`Fulfilment status: ${statusLabel(status)}`}>
            <div className="flex items-center gap-1.5" aria-hidden="true">
                {STATUS_STEPS.map((step, index) => {
                    const isComplete = !isExceptional && index <= completedIndex;
                    const isCurrent = !isExceptional && index === currentIndex;

                    return (
                        <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full ${
                                isComplete ? 'bg-indigo-400' : 'bg-white/10'
                            } ${isCurrent ? 'ring-2 ring-indigo-400/20' : ''}`}
                        />
                    );
                })}
            </div>
            <div className="flex justify-between gap-2 text-[9px] text-slate-500 sm:text-[10px]">
                <span>Processing</span>
                <span>Packed</span>
                <span>Dispatch</span>
                <span>Delivered</span>
            </div>
            {isExceptional && (
                <p className={`text-xs ${status === 'ON_HOLD' ? 'text-amber-300' : 'text-rose-300'}`}>
                    {status === 'ON_HOLD'
                        ? 'This fulfilment is on hold. Resume processing when ready.'
                        : 'Delivery failed. Resolve the issue before restarting fulfilment.'}
                </p>
            )}
        </div>
    );
}

function HistoryEntry({
    entry,
    currentUser,
}: {
    entry: ApiFulfilmentHistoryEntry;
    currentUser: CurrentUser;
}) {
    return (
        <li className="relative pl-6 pb-5 last:pb-0">
            <span className="absolute left-[3px] top-1.5 h-2 w-2 rounded-full bg-indigo-400 ring-4 ring-indigo-400/10" />
            <span className="absolute left-[6px] top-4 h-[calc(100%-12px)] w-px bg-white/10 last:hidden" />
            <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-200">
                    {entry.previousStatus && entry.previousStatus === entry.newStatus
                        ? 'Delivery details updated'
                        : entry.previousStatus
                          ? `${statusLabel(entry.previousStatus)} → ${statusLabel(entry.newStatus)}`
                          : `Fulfilment started: ${statusLabel(entry.newStatus)}`}
                </p>
                <time className="text-[10px] text-slate-500">{formatDate(entry.createdAt)}</time>
            </div>
            {entry.note && <p className="mt-1 text-xs leading-5 text-slate-400">{entry.note}</p>}
            {entry.actorUserId && (
                <p className="mt-1 text-[11px] text-slate-500">
                    Updated by <span className="font-medium text-slate-300">
                        {currentUser.id && entry.actorUserId === currentUser.id
                            ? currentUser.name
                            : 'Team member'}
                    </span>
                </p>
            )}
        </li>
    );
}

export default function OrderDetailsDrawer({
    order,
    onClose,
    onFulfilmentUpdated,
}: {
    order: Order | null;
    onClose: () => void;
    onFulfilmentUpdated: (orderId: string, fulfilment: ApiOrderFulfilment) => void;
}) {
    const selectedOrder = order;
    const currentFulfilment = selectedOrder?.fulfilment ?? null;
    const currentStatus: FulfilmentStatus = currentFulfilment?.status ?? 'NOT_STARTED';
    const allowedNextStatuses = ALLOWED_NEXT_STATUSES[currentStatus];
    const primaryNextStatus = PRIMARY_STATUS[currentStatus];

    const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
    const [deliveryProvider, setDeliveryProvider] = useState('');
    const [trackingReference, setTrackingReference] = useState('');
    const [operationalNotes, setOperationalNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [fulfilmentError, setFulfilmentError] = useState('');
    const [fulfilmentSuccess, setFulfilmentSuccess] = useState('');
    const [isEditingDelivery, setIsEditingDelivery] = useState(false);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser>({ id: null, name: 'You' });

    useEffect(() => {
        let cancelled = false;

        apiCall<Record<string, unknown>>('/auth/profile')
            .then((profile) => {
                if (!cancelled) {
                    setCurrentUser(resolveCurrentUser(profile));
                }
            })
            .catch(() => {
                // Keep the activity panel usable if profile lookup temporarily fails.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setActiveTab('overview');
        setDeliveryProvider(currentFulfilment?.deliveryProvider ?? '');
        setTrackingReference(currentFulfilment?.trackingReference ?? '');
        setOperationalNotes(currentFulfilment?.operationalNotes ?? '');
        setIsEditingDelivery(false);
        setShowPaymentHistory(false);
        setFulfilmentError('');
        setFulfilmentSuccess('');
        // Reset drafts only when a different order is opened.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOrder?.id]);

    const deliveryIsDirty = useMemo(() => {
        return (
            deliveryProvider !== (currentFulfilment?.deliveryProvider ?? '') ||
            trackingReference !== (currentFulfilment?.trackingReference ?? '') ||
            operationalNotes !== (currentFulfilment?.operationalNotes ?? '')
        );
    }, [
        deliveryProvider,
        trackingReference,
        operationalNotes,
        currentFulfilment?.deliveryProvider,
        currentFulfilment?.trackingReference,
        currentFulfilment?.operationalNotes,
    ]);

    async function updateFulfilment(
        status: FulfilmentStatus,
        deliveryValues: {
            deliveryProvider: string;
            trackingReference: string;
            operationalNotes: string;
        },
    ) {
        if (!selectedOrder || isSaving || selectedOrder.isLocalDraft) return;

        setIsSaving(true);
        setFulfilmentError('');
        setFulfilmentSuccess('');

        try {
            const updated = await apiCall<ApiOrderFulfilment>(
                `/orders/${encodeURIComponent(selectedOrder.id)}/fulfilment`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        status,
                        deliveryProvider: deliveryValues.deliveryProvider.trim(),
                        trackingReference: deliveryValues.trackingReference.trim(),
                        operationalNotes: deliveryValues.operationalNotes.trim(),
                    }),
                },
            );

            onFulfilmentUpdated(selectedOrder.id, updated);
            setDeliveryProvider(updated.deliveryProvider ?? '');
            setTrackingReference(updated.trackingReference ?? '');
            setOperationalNotes(updated.operationalNotes ?? '');
            setFulfilmentSuccess(`Fulfilment updated to ${statusLabel(updated.status)}.`);
            return updated;
        } catch (err) {
            setFulfilmentError(
                err instanceof Error ? err.message : 'Unable to update fulfilment. Please try again.',
            );
            return null;
        } finally {
            setIsSaving(false);
        }
    }

    async function handleStatusChange(status: FulfilmentStatus) {
        if (!selectedOrder || !status) return;

        // Status actions only submit persisted delivery values, never unsaved edits
        // sitting in the Delivery tab.
        const updated = await updateFulfilment(status, {
            deliveryProvider: currentFulfilment?.deliveryProvider ?? '',
            trackingReference: currentFulfilment?.trackingReference ?? '',
            operationalNotes: currentFulfilment?.operationalNotes ?? '',
        });

        if (updated) {
            setIsEditingDelivery(false);
        }
    }

    async function handleDeliverySave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const updated = await updateFulfilment(currentStatus, {
            deliveryProvider,
            trackingReference,
            operationalNotes,
        });

        if (updated) {
            setIsEditingDelivery(false);
        }
    }

    function cancelDeliveryEdit() {
        setDeliveryProvider(currentFulfilment?.deliveryProvider ?? '');
        setTrackingReference(currentFulfilment?.trackingReference ?? '');
        setOperationalNotes(currentFulfilment?.operationalNotes ?? '');
        setIsEditingDelivery(false);
        setFulfilmentError('');
    }

    useEffect(() => {
        if (!selectedOrder) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedOrder, onClose]);

    if (!selectedOrder) return null;

    const completedPayments = selectedOrder.payments
        .filter((payment) => payment.status === 'COMPLETED')
        .reduce((sum, payment) => sum + amountValue(payment.amount), 0);
    const fulfilmentHistory = [...(currentFulfilment?.history ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const itemCount = selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0);
    const hasDeliveryMetadata = Boolean(
        currentFulfilment?.deliveryProvider ||
            currentFulfilment?.trackingReference ||
            currentFulfilment?.operationalNotes,
    );

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <button
                type="button"
                aria-label="Close order details"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-slate-950/70 backdrop-blur-sm"
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-drawer-title"
                className="relative flex h-full w-full flex-col overflow-hidden border-l border-t border-indigo-400/20 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95 text-slate-100 shadow-2xl lg:w-[50vw] lg:max-w-none"
            >
                <header className="shrink-0 border-b border-white/[0.08] bg-gradient-to-br from-indigo-500/[0.08] via-slate-950/95 to-slate-950 px-5 py-5 backdrop-blur-xl sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                                Order details
                            </p>
                            <h2 id="order-drawer-title" className="mt-1 break-all font-mono text-lg font-bold text-white sm:text-xl">
                                {selectedOrder.reference}
                            </h2>
                            <p className="mt-1 truncate text-xs text-slate-400">
                                {selectedOrder.customerName || 'Customer'} · {formatDate(selectedOrder.createdAt)}
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-label="Close order details"
                            onClick={onClose}
                            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <span aria-hidden="true">✕</span>
                        </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusPill status={currentStatus} />
                        <span className="text-slate-700" aria-hidden="true">·</span>
                        <span className="text-xs text-slate-400">Payment</span>
                        <StatusPill status={selectedOrder.rawPaymentStatus} />
                        {selectedOrder.isLocalDraft && <StatusPill status="LOCAL_DRAFT" />}
                    </div>
                </header>

                {selectedOrder.isLocalDraft && (
                    <div className="shrink-0 border-b border-amber-400/20 bg-amber-400/5 px-5 py-3 sm:px-6">
                        <p className="text-xs font-semibold text-amber-200">Local-only draft</p>
                        <p className="mt-1 text-xs leading-5 text-amber-100/70">
                            This draft is not saved to the server. Fulfilment actions are disabled until the order exists on the server.
                        </p>
                    </div>
                )}

                <div className="shrink-0 border-b border-white/[0.08] bg-slate-950/70 px-4 sm:px-7">
                    <nav className="flex gap-5" aria-label="Order details sections">
                        {([
                            ['overview', 'Overview'],
                            ['delivery', 'Delivery'],
                            ['activity', 'Activity'],
                        ] as [DrawerTab, string][]).map(([tab, label]) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab);
                                    setFulfilmentError('');
                                }}
                                className={`border-b-2 px-1 py-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400 ${
                                    activeTab === tab
                                        ? 'border-indigo-400 text-indigo-100'
                                        : 'border-transparent text-slate-500 hover:border-white/20 hover:text-slate-200'
                                }`}
                                aria-current={activeTab === tab ? 'page' : undefined}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                <main className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Fulfilment progress</p>
                                        <h3 className="mt-1 text-base font-semibold text-white">{statusLabel(currentStatus)}</h3>
                                    </div>
                                    <StatusPill status={currentStatus} />
                                </div>
                                <div className="mt-4">
                                    <FulfilmentProgress status={currentStatus} />
                                </div>
                                <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-white">
                                            {primaryNextStatus ? `Next: ${statusLabel(primaryNextStatus)}` : 'Fulfilment complete'}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                            {primaryNextStatus
                                                ? 'Update the status when this step is complete.'
                                                : 'No further fulfilment transitions are available.'}
                                        </p>
                                    </div>
                                    {primaryNextStatus && (
                                        <button
                                            type="button"
                                            onClick={() => void handleStatusChange(primaryNextStatus)}
                                            disabled={isSaving || selectedOrder.isLocalDraft}
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving…' : `Mark as ${statusLabel(primaryNextStatus)}`}
                                            {!isSaving && <span aria-hidden="true">→</span>}
                                        </button>
                                    )}
                                </div>
                                {allowedNextStatuses.includes('ON_HOLD') && (
                                    <button
                                        type="button"
                                        onClick={() => void handleStatusChange('ON_HOLD')}
                                        disabled={isSaving || selectedOrder.isLocalDraft}
                                        className="mt-3 text-xs font-medium text-amber-300 transition hover:text-amber-200 disabled:opacity-50"
                                    >
                                        Place on hold
                                    </button>
                                )}
                                {currentStatus === 'ON_HOLD' && (
                                    <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-5 text-amber-200">
                                        This order is on hold. Use the primary action to resume processing.
                                    </p>
                                )}
                                {currentStatus === 'DELIVERY_FAILED' && (
                                    <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/5 p-3 text-xs leading-5 text-rose-200">
                                        Delivery failed. Review the delivery details and resolve the issue before restarting processing.
                                    </p>
                                )}
                            </section>

                            {fulfilmentError && (
                                <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-xs leading-5 text-rose-200">
                                    {fulfilmentError}
                                </p>
                            )}
                            {fulfilmentSuccess && (
                                <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs leading-5 text-emerald-200">
                                    {fulfilmentSuccess}
                                </p>
                            )}

                            <section className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <SectionTitle>Order summary</SectionTitle>
                                    <span className="text-xs text-slate-500">{itemCount} item{itemCount === 1 ? '' : 's'}</span>
                                </div>
                                <div className="overflow-hidden rounded-xl border border-white/10">
                                    {selectedOrder.items.length > 0 ? selectedOrder.items.map((item, index) => (
                                        <div key={item.id} className={`flex items-start justify-between gap-4 px-4 py-3 ${index > 0 ? 'border-t border-white/5' : ''}`}>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-200">{item.productName}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Qty {item.quantity} × {money(amountValue(item.unitPrice))}
                                                    {item.sku ? ` · SKU ${item.sku}` : ''}
                                                </p>
                                            </div>
                                            <p className="whitespace-nowrap font-mono text-sm text-white">{money(amountValue(item.totalPrice))}</p>
                                        </div>
                                    )) : <div className="p-4"><EmptyState>No item-level details are available.</EmptyState></div>}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <SectionTitle>Payment summary</SectionTitle>
                                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span className="text-slate-400">Subtotal</span>
                                        <span className="font-mono text-slate-200">{money(selectedOrder.subtotal)}</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                                        <span className="text-slate-400">Shipping</span>
                                        <span className="font-mono text-slate-200">{money(selectedOrder.shippingFee)}</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                                        <span className="text-sm font-semibold text-white">Order total</span>
                                        <span className="font-mono text-lg font-bold text-white">{money(selectedOrder.totalAmount)}</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-4 text-xs">
                                        <span className="text-slate-500">Completed payments</span>
                                        <span className="font-mono text-emerald-300">{money(completedPayments)}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <SectionTitle>Customer</SectionTitle>
                                <div className="grid grid-cols-1 gap-4 rounded-xl border border-white/10 p-4 sm:grid-cols-2">
                                    <Field label="Name" value={selectedOrder.customerName} />
                                    <Field label="Phone" value={selectedOrder.contactNumber} />
                                    <Field label="Email" value={selectedOrder.email} />
                                    <Field label="Address" value={selectedOrder.customerAddress} />
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'delivery' && (
                        <div className="space-y-5">
                            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <SectionTitle>Delivery details</SectionTitle>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">Carrier and tracking information for this fulfilment.</p>
                                    </div>
                                    {!isEditingDelivery && !selectedOrder.isLocalDraft && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditingDelivery(true);
                                                setFulfilmentError('');
                                                setFulfilmentSuccess('');
                                            }}
                                            className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
                                        >
                                            Edit details
                                        </button>
                                    )}
                                </div>
                                {!isEditingDelivery ? (
                                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <Field label="Delivery provider" value={currentFulfilment?.deliveryProvider} />
                                        <Field label="Tracking reference" value={currentFulfilment?.trackingReference} mono />
                                        <Field label="Shipping method" value={selectedOrder.shippingMethod} />
                                        <Field label="Order tracking number" value={selectedOrder.trackingNumber} mono />
                                        <div className="sm:col-span-2">
                                            <Field label="Delivery address" value={selectedOrder.deliveryAddress || selectedOrder.customerAddress} />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Field label="Operational notes" value={currentFulfilment?.operationalNotes} />
                                        </div>
                                    </div>
                                ) : (
                                    <form id="fulfilment-delivery-form" onSubmit={handleDeliverySave} className="mt-5 space-y-4">
                                        <div>
                                            <label htmlFor="fulfilment-provider" className="mb-1.5 block text-xs font-medium text-slate-300">Delivery provider</label>
                                            <input id="fulfilment-provider" value={deliveryProvider} onChange={(event) => setDeliveryProvider(event.target.value)} maxLength={100} disabled={isSaving} placeholder="e.g. PUDO, The Courier Guy" className={inputClassName()} />
                                        </div>
                                        <div>
                                            <label htmlFor="fulfilment-tracking" className="mb-1.5 block text-xs font-medium text-slate-300">Tracking reference</label>
                                            <input id="fulfilment-tracking" value={trackingReference} onChange={(event) => setTrackingReference(event.target.value)} maxLength={150} disabled={isSaving} placeholder="Enter tracking number" className={inputClassName()} />
                                        </div>
                                        <div>
                                            <label htmlFor="fulfilment-notes" className="mb-1.5 block text-xs font-medium text-slate-300">Operational notes</label>
                                            <textarea id="fulfilment-notes" value={operationalNotes} onChange={(event) => setOperationalNotes(event.target.value)} maxLength={2000} rows={4} disabled={isSaving} placeholder="Packing, dispatch, or delivery notes…" className={`${inputClassName()} resize-y`} />
                                        </div>
                                        <p className="text-[11px] leading-5 text-slate-500">Saving these details will not change the fulfilment status.</p>
                                    </form>
                                )}
                            </section>

                            {fulfilmentError && (
                                <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-xs leading-5 text-rose-200">{fulfilmentError}</p>
                            )}
                            {fulfilmentSuccess && (
                                <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs leading-5 text-emerald-200">{fulfilmentSuccess}</p>
                            )}

                            <section className="space-y-3">
                                <SectionTitle>Delivery destination</SectionTitle>
                                <div className="rounded-xl border border-white/10 p-4">
                                    <p className="text-sm leading-6 text-slate-200">{selectedOrder.deliveryAddress || selectedOrder.customerAddress || 'No delivery address recorded.'}</p>
                                    <p className="mt-3 text-xs text-slate-500">Recipient contact</p>
                                    <p className="mt-1 text-sm text-slate-300">{selectedOrder.customerName || '—'}</p>
                                    <p className="mt-1 text-sm text-slate-400">{selectedOrder.contactNumber || selectedOrder.email || 'No contact details recorded'}</p>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-6">
                            <section className="space-y-4">
                                <div>
                                    <SectionTitle>Fulfilment activity</SectionTitle>
                                    <p className="mt-1 text-xs text-slate-500">Status changes recorded for this order.</p>
                                </div>
                                {fulfilmentHistory.length > 0 ? (
                                    <ol className="pt-1">
                                        {fulfilmentHistory.map((entry) => (
                                            <HistoryEntry
                                                key={entry.id}
                                                entry={entry}
                                                currentUser={currentUser}
                                            />
                                        ))}
                                    </ol>
                                ) : (
                                    <EmptyState>No fulfilment history has been recorded yet.</EmptyState>
                                )}
                            </section>

                            <section className="overflow-hidden rounded-xl border border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentHistory((visible) => !visible)}
                                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
                                    aria-expanded={showPaymentHistory}
                                >
                                    <span>
                                        <span className="block text-sm font-semibold text-white">Payment history</span>
                                        <span className="mt-1 block text-xs text-slate-500">{selectedOrder.payments.length} payment record{selectedOrder.payments.length === 1 ? '' : 's'}</span>
                                    </span>
                                    <span className="text-slate-400" aria-hidden="true">{showPaymentHistory ? '−' : '+'}</span>
                                </button>
                                {showPaymentHistory && (
                                    <div className="space-y-3 border-t border-white/10 p-3 sm:p-4">
                                        {selectedOrder.payments.length > 0 ? selectedOrder.payments.map((payment) => (
                                            <article key={payment.id} className="rounded-xl border border-white/10 p-3">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-200">{payment.provider || 'Payment provider'}</p>
                                                        <p className="mt-1 break-all font-mono text-[10px] text-slate-500">{payment.providerReference || payment.transactionReference || payment.paymentRequestId || 'No payment reference'}</p>
                                                    </div>
                                                    <StatusPill status={payment.status} />
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-3">
                                                    <Field label="Amount" value={`${payment.currency || 'ZAR'} ${amountValue(payment.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                                                    <Field label="Created" value={formatDate(payment.createdAt)} />
                                                    <Field label="Completed" value={formatDate(payment.completedAt)} />
                                                    <Field label="Updated" value={formatDate(payment.updatedAt)} />
                                                </div>
                                                {payment.providerStatusMessage && <p className="mt-3 border-t border-white/5 pt-3 text-xs leading-5 text-slate-400">{payment.providerStatusMessage}</p>}
                                            </article>
                                        )) : <EmptyState>No payment records are associated with this order.</EmptyState>}
                                    </div>
                                )}
                            </section>

                            <section className="space-y-3">
                                <SectionTitle>Order record</SectionTitle>
                                <div className="grid grid-cols-1 gap-4 rounded-xl border border-white/10 p-4 sm:grid-cols-2">
                                    <Field label="Created" value={formatDate(selectedOrder.createdAt)} />
                                    <Field label="Last updated" value={formatDate(selectedOrder.updatedAt)} />
                                    <div className="sm:col-span-2"><Field label="Order ID" value={selectedOrder.id} mono /></div>
                                </div>
                            </section>
                        </div>
                    )}
                </main>

                {(activeTab === 'delivery' && isEditingDelivery) && (
                    <footer className="shrink-0 border-t border-white/[0.08] bg-slate-950/95 px-5 py-4 shadow-[0_-12px_40px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:px-7">
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={cancelDeliveryEdit}
                                disabled={isSaving}
                                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const form = document.getElementById('fulfilment-delivery-form') as HTMLFormElement | null;
                                    form?.requestSubmit();
                                }}
                                disabled={isSaving || !deliveryIsDirty || selectedOrder.isLocalDraft}
                                className="rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? 'Saving delivery details…' : 'Save delivery details'}
                            </button>
                        </div>
                    </footer>
                )}
            </aside>
        </div>
    );
}
