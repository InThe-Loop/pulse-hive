'use client';

import { useEffect } from 'react';

import type { PaymentRecord } from '../lib/payments.types';

import {
    formatDate,
    money,
    paymentReference,
    providerLabel,
    statusClasses,
    statusLabel,
} from '../lib/payments.utils';

function StatusPill({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClasses(status)}`}
        >
            {statusLabel(status)}
        </span>
    );
}

function DetailField({
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
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {label}
            </p>

            <p
                className={`break-words text-sm text-slate-200 ${
                    mono ? 'font-mono' : ''
                }`}
            >
                {value === undefined || value === null || value === ''
                    ? '—'
                    : value}
            </p>
        </div>
    );
}

export default function PaymentDetailsDrawer({
    payment,
    onClose,
}: {
    payment: PaymentRecord | null;
    onClose: () => void;
}) {
    useEffect(() => {
        if (!payment) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [payment, onClose]);

    if (!payment) return null;

    const currency = payment.currency || 'ZAR';

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-drawer-title"
                className="relative flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-white/10 bg-slate-950 shadow-2xl"
            >
                {/* Drawer header */}
                <header className="shrink-0 border-b border-white/[0.08] bg-gradient-to-br from-indigo-500/[0.08] via-slate-950 to-slate-950 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                                Payment details
                            </p>

                            <h2
                                id="payment-drawer-title"
                                className="mt-2 break-all font-mono text-lg font-black text-white"
                            >
                                {paymentReference(payment)}
                            </h2>

                            <p className="mt-2 text-xs text-slate-500">
                                {providerLabel(payment.provider)} ·{' '}
                                {formatDate(payment.createdAt)}
                            </p>
                        </div>

                        <button
                            type="button"
                            aria-label="Close payment details"
                            onClick={onClose}
                            className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <span aria-hidden="true">✕</span>
                        </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <StatusPill status={payment.status} />

                        <span className="text-[10px] text-slate-500">
                            Transaction record
                        </span>
                    </div>
                </header>

                {/* Scrollable drawer body */}
                <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6">

                    {/* Amount */}
                    <section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Transaction amount
                        </p>

                        <p className="mt-3 break-words font-mono text-3xl font-black tracking-tight text-white">
                            {money(Number(payment.amount), currency)}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                            Recorded payment amount
                        </p>
                    </section>

                    {/* Customer */}
                    <section>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Customer
                        </h3>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <DetailField
                                label="Name"
                                value={payment.customerName}
                            />

                            <DetailField
                                label="Phone"
                                value={payment.customerPhone}
                            />

                            <div className="sm:col-span-2">
                                <DetailField
                                    label="Email"
                                    value={payment.customerEmail}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Order */}
                    <section>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Linked order
                        </h3>

                        {payment.order ? (
                            <div className="rounded-xl border border-indigo-400/15 bg-indigo-400/[0.04] p-4">
                                <DetailField
                                    label="Order reference"
                                    value={payment.order.reference}
                                    mono
                                />

                                <p className="mt-3 text-[10px] text-slate-500">
                                    This payment is linked to an order in this
                                    workspace.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-amber-400/20 bg-amber-400/[0.03] p-4">
                                <p className="text-sm font-semibold text-amber-200">
                                    No linked order
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    This payment record is not currently
                                    associated with an order.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Provider information */}
                    <section>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Payment provider
                        </h3>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <DetailField
                                label="Provider"
                                value={providerLabel(payment.provider)}
                            />

                            <DetailField
                                label="Currency"
                                value={currency}
                            />

                            <div className="sm:col-span-2">
                                <DetailField
                                    label="Provider reference"
                                    value={payment.providerReference}
                                    mono
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <DetailField
                                    label="Transaction reference"
                                    value={payment.transactionReference}
                                    mono
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <DetailField
                                    label="Payment request ID"
                                    value={payment.paymentRequestId}
                                    mono
                                />
                            </div>
                        </div>
                    </section>

                    {/* Timestamps */}
                    <section>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Transaction timestamps
                        </h3>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <DetailField
                                label="Created"
                                value={formatDate(payment.createdAt)}
                            />

                            <DetailField
                                label="Completed"
                                value={formatDate(payment.completedAt)}
                            />

                            <DetailField
                                label="Last updated"
                                value={formatDate(payment.updatedAt)}
                            />
                        </div>
                    </section>

                    {/* Provider response */}
                    {payment.providerStatusMessage && (
                        <section>
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Provider response
                            </h3>

                            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                                <p className="whitespace-pre-wrap break-words text-xs leading-6 text-slate-300">
                                    {payment.providerStatusMessage}
                                </p>
                            </div>
                        </section>
                    )}

                    <section className="border-t border-white/[0.06] pt-4">
                        <DetailField
                            label="Internal payment record ID"
                            value={payment.id}
                            mono
                        />
                    </section>
                </div>

                {/* Pinned footer */}
                <footer className="shrink-0 border-t border-white/[0.08] bg-slate-950/95 px-6 py-4 backdrop-blur-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        Close details
                    </button>
                </footer>
            </aside>
        </div>
    );
}
