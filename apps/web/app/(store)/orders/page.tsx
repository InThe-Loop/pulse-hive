'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    PackageOpen,
    Clock,
    Loader2,
    CheckCircle2,
    PackageCheck,
    Truck,
    Package,
    ArrowRight,
    ChevronDown,
    ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { customerApiClient } from '@/app/api/api-client';

const ORDER_STEPS = [
    { key: 'placed', label: 'Order Placed', icon: Clock },
    { key: 'processing', label: 'Curating & Packing', icon: PackageCheck },
    { key: 'dispatched', label: 'Dispatched', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

interface CustomerIdentity {
    id: string;
    phone: string;
}

export default function OrdersPage() {
    const { orders } = useCart();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let active = true;

        const verifyAuth = async () => {
            const token = localStorage.getItem('customer_auth_token');

            if (!token) {
                router.replace('/signin');
                return;
            }

            try {
                await customerApiClient.get<CustomerIdentity>(
                    '/customer/auth/me'
                );

                if (active) {
                    setAuthError(null);
                    setLoading(false);
                }
            } catch {
                if (active) {
                    setAuthError(
                        'We could not verify your customer session. Please try again.'
                    );
                    setLoading(false);
                }
            }
        };

        verifyAuth();

        return () => {
            active = false;
        };
    }, [router]);

    const retryAuthentication = async () => {
        setAuthError(null);
        setLoading(true);

        try {
            await customerApiClient.get<CustomerIdentity>(
                '/customer/auth/me'
            );
            setLoading(false);
        } catch {
            setAuthError(
                'We could not verify your customer session. Please try again.'
            );
            setLoading(false);
        }
    };

    const toggleOrder = (orderId: string) => {
        setExpandedOrders((current) => ({
            ...current,
            [orderId]: !current[orderId],
        }));
    };

    const getActiveStepIndex = (order: any) => {
        const status = (order.status || 'placed').toLowerCase();

        if (status.includes('deliver')) return 3;
        if (status.includes('dispatch') || status.includes('shipped')) return 2;
        if (status.includes('process') || status.includes('pack')) return 1;

        return 0;
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center bg-(--color-background)">
                <div className="flex flex-col items-center gap-4">
                    <Loader2
                        size={25}
                        className="animate-spin text-(--color-gold)"
                    />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-(--color-text-muted)">
                        Verifying your customer account
                    </span>
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center bg-(--color-background) px-5">
                <div className="w-full max-w-md border border-(--color-border-strong) bg-(--color-surface-elevated) p-8 text-center sm:p-10">
                    <ShieldCheck
                        size={28}
                        className="mx-auto text-(--color-gold)"
                    />
                    <h1 className="mt-5 font-display text-2xl font-semibold text-(--color-text)">
                        Session verification
                    </h1>
                    <p className="mt-3 text-xs leading-6 text-(--color-text-muted)">
                        {authError}
                    </p>
                    <button
                        type="button"
                        onClick={retryAuthentication}
                        className="button-gold mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 text-[10px] font-bold uppercase tracking-[0.16em]"
                    >
                        Try again
                    </button>
                    <Link
                        href="/account"
                        className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-gold)"
                    >
                        Return to account
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-(--color-background) pb-12 text-(--color-text)">
            <main className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-5 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.65fr)] lg:pt-16">

                {/* Left account panel */}
                <aside className="relative h-fit overflow-hidden border border-(--color-border-strong) bg-[linear-gradient(155deg,#1b1812_0%,#12110f_58%,#0d0d0c_100%)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.2)] sm:p-7 lg:sticky lg:top-28">
                    <div className="absolute inset-x-0 top-0 h-px gold-foil opacity-70" />

                    <div className="relative z-10">
                        <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                            Your account
                        </span>

                        <div className="mt-5 h-px w-full bg-(--color-border)" />

                        <h1 className="mt-5 font-serif text-3xl leading-tight text-white sm:text-4xl">
                            Your Orders
                        </h1>

                        <p className="mt-4 max-w-sm font-body text-xs leading-6 text-white/60 sm:text-sm">
                            Every detail of your purchases, thoughtfully brought together. Follow your orders from confirmation to delivery.
                        </p>

                        <div className="mt-8 flex items-center gap-3 border border-(--color-gold)/25 bg-black/20 px-4 py-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-(--color-gold)/25 bg-(--color-gold)/[0.05] text-(--color-gold-light)">
                                <Package size={18} strokeWidth={1.5} />
                            </div>

                            <div>
                                <span className="block font-display text-2xl font-semibold text-white">
                                    {orders.length}
                                </span>
                                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">
                                    {orders.length === 1 ? 'Purchase' : 'Purchases'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-white/10 pt-6">
                            <span className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-(--color-gold-light)">
                                Discover more
                            </span>

                            <p className="mt-2 font-body text-xs leading-6 text-white/50">
                                Explore the collection and find something special for your next beauty ritual.
                            </p>

                            <Link
                                href="/"
                                className="mt-5 inline-flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-gold-light) transition-colors hover:text-white"
                            >
                                Continue shopping
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Right panel */}
                <section className="min-w-0">
                    {/* Account-matching header */}
                    <header className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-9 sm:px-10 sm:py-11 lg:px-12">
                        <div className="absolute inset-x-0 top-0 h-px gold-foil" />
                        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-(--color-gold)/10" />
                        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-(--color-gold)/10" />

                        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <span className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-(--color-gold-light)">
                                    Your purchases
                                </span>

                                <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                                    Purchase History
                                </h2>

                                <p className="mt-3 max-w-lg font-body text-xs leading-6 text-white/60 sm:text-sm">
                                    View your purchases and follow each order through its journey to delivery.
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3 border border-(--color-gold)/25 bg-black/20 px-4 py-3">
                                <Package
                                    size={17}
                                    strokeWidth={1.5}
                                    className="text-(--color-gold-light)"
                                />
                                <div>
                                    <span className="block font-display text-xl font-semibold text-white">
                                        {orders.length}
                                    </span>
                                    <span className="block font-body text-[8px] font-bold uppercase tracking-[0.16em] text-white/50">
                                        {orders.length === 1 ? 'Purchase' : 'Purchases'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {orders.length === 0 ? (
                        <section className="relative flex w-full flex-col items-center justify-center overflow-hidden border border-(--color-border-strong) bg-(--color-surface-elevated)/70 px-6 py-14 text-center sm:py-20">
                            <div className="absolute inset-x-0 top-0 h-px gold-foil opacity-40" />

                            <div className="flex h-16 w-16 items-center justify-center border border-(--color-gold)/25 bg-(--color-gold)/[0.05] text-(--color-gold)">
                                <PackageOpen size={27} strokeWidth={1.2} />
                            </div>

                            <span className="mt-6 font-body text-[9px] font-bold uppercase tracking-[0.25em] text-(--color-gold)">
                                A little something awaits
                            </span>

                            <h3 className="mt-3 font-display text-2xl font-semibold text-(--color-text)">
                                Your story starts here
                            </h3>

                            <p className="mt-3 max-w-sm font-body text-xs leading-6 text-(--color-text-muted)">
                                You haven't placed an order just yet. Once you discover your favourites, your purchase details and delivery progress will find a home here.
                            </p>

                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="button-gold mt-7 inline-flex min-h-11 items-center justify-center gap-3 px-7 text-[9px] font-bold uppercase tracking-[0.18em]"
                            >
                                Explore the collection
                                <ArrowRight size={14} />
                            </button>
                        </section>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {orders.map((order: any, index: number) => {
                                const activeStepIndex = getActiveStepIndex(order);
                                const isExpanded = Boolean(expandedOrders[order.id]);
                                const detailsId = `order-details-${order.id}`;

                                return (
                                    <article
                                        key={order.id}
                                        className="overflow-hidden border border-(--color-border-strong) bg-(--color-surface-elevated)/70 transition-colors"
                                    >
                                        <div className="h-px w-full gold-foil opacity-50" />

                                        <button
                                            type="button"
                                            onClick={() => toggleOrder(order.id)}
                                            aria-expanded={isExpanded}
                                            aria-controls={detailsId}
                                            className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left transition-colors hover:bg-(--color-gold)/[0.03] sm:px-6 sm:py-6"
                                        >
                                            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-(--color-gold)/25 bg-(--color-gold)/[0.05] text-(--color-gold)">
                                                    <Package size={18} strokeWidth={1.4} />
                                                </div>

                                                <div className="min-w-0">
                                                    <span className="block font-body text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-gold)">
                                                        Order {String(index + 1).padStart(2, '0')}
                                                    </span>

                                                    <span className="mt-1.5 block break-all font-mono text-xs font-semibold tracking-wide text-(--color-text) sm:text-sm">
                                                        #{order.id}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                                                <div className="text-right">
                                                    <span className="block font-body text-[8px] font-bold uppercase tracking-[0.16em] text-(--color-text-muted)">
                                                        Order total
                                                    </span>

                                                    <span className="mt-1 block font-display text-lg font-semibold tracking-tight text-(--color-gold-light) sm:text-2xl">
                                                        R{Number(order.total).toFixed(2)}
                                                    </span>
                                                </div>

                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center border border-(--color-border) text-(--color-text-muted) transition-transform duration-300 ${isExpanded ? 'rotate-180 border-(--color-gold)/40 text-(--color-gold)' : ''}`}>
                                                    <ChevronDown size={16} />
                                                </div>
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div
                                                id={detailsId}
                                                className="border-t border-(--color-border)"
                                            >
                                                <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
                                                    <div>
                                                        <span className="block font-body text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)">
                                                            Recipient
                                                        </span>
                                                        <span className="mt-1.5 block text-xs text-(--color-text)">
                                                            {order.customerName}
                                                        </span>
                                                    </div>

                                                    <div className="sm:text-right">
                                                        <span className="block font-body text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)">
                                                            Order date
                                                        </span>
                                                        <span className="mt-1.5 block text-xs text-(--color-text)">
                                                            {new Date(order.createdAt).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                }
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border-y border-(--color-border) bg-(--color-background)/40 px-5 py-6 sm:px-6">
                                                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <span className="block font-body text-[9px] font-bold uppercase tracking-[0.22em] text-(--color-gold)">
                                                                The journey
                                                            </span>
                                                            <h3 className="mt-1 font-display text-lg font-medium text-(--color-text)">
                                                                Order progression
                                                            </h3>
                                                        </div>

                                                        <span className="border border-(--color-gold)/25 bg-(--color-gold)/[0.05] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-(--color-gold)">
                                                            {ORDER_STEPS[activeStepIndex].label}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                                                        {ORDER_STEPS.map((step, idx) => {
                                                            const isCompleted = idx <= activeStepIndex;
                                                            const isCurrent = idx === activeStepIndex;
                                                            const StepIcon = step.icon;

                                                            return (
                                                                <div
                                                                    key={step.key}
                                                                    className={`relative flex min-h-[116px] flex-col items-center justify-center border px-2 py-4 text-center transition-colors ${
                                                                        isCurrent
                                                                            ? 'border-(--color-gold)/60 bg-(--color-gold)/[0.07]'
                                                                            : isCompleted
                                                                              ? 'border-(--color-gold-dark)/40 bg-(--color-surface)'
                                                                              : 'border-(--color-border) bg-(--color-background) opacity-55'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full border ${
                                                                            isCurrent || isCompleted
                                                                                ? 'gold-foil border-transparent text-[#171108]'
                                                                                : 'border-(--color-border) bg-(--color-surface) text-(--color-text-muted)'
                                                                        }`}
                                                                    >
                                                                        <StepIcon size={15} strokeWidth={1.6} />
                                                                    </div>

                                                                    <span className="text-[9px] font-bold leading-tight text-(--color-text) sm:text-[10px]">
                                                                        {step.label}
                                                                    </span>

                                                                    <span
                                                                        className={`mt-2 text-[8px] uppercase tracking-[0.1em] ${
                                                                            isCompleted
                                                                                ? 'text-(--color-gold)'
                                                                                : 'text-(--color-text-muted)'
                                                                        }`}
                                                                    >
                                                                        {isCompleted
                                                                            ? isCurrent
                                                                                ? 'In progress'
                                                                                : 'Completed'
                                                                            : 'Pending'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="px-5 py-6 sm:px-6">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <span className="block font-body text-[9px] font-bold uppercase tracking-[0.22em] text-(--color-gold)">
                                                                Your selection
                                                            </span>
                                                            <h3 className="mt-1 font-display text-lg font-medium text-(--color-text)">
                                                                Order items
                                                            </h3>
                                                        </div>

                                                        <span className="text-[9px] uppercase tracking-[0.14em] text-(--color-text-muted)">
                                                            {order.items.length}{' '}
                                                            {order.items.length === 1 ? 'item' : 'items'}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 divide-y divide-(--color-border) border-y border-(--color-border)">
                                                        {order.items.map((item: any) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center justify-between gap-4 py-4"
                                                            >
                                                                <div className="min-w-0">
                                                                    <span className="block text-xs font-medium text-(--color-text)">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="mt-1.5 block text-[10px] text-(--color-text-muted)">
                                                                        Quantity: {item.quantity}
                                                                    </span>
                                                                </div>

                                                                <span className="shrink-0 font-display text-base font-semibold text-(--color-gold-light)">
                                                                    R{(
                                                                        item.price * item.quantity
                                                                    ).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
