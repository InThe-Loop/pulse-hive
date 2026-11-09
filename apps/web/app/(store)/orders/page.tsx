'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    PackageOpen,
    Clock,
    Loader2,
    CheckCircle2,
    PackageCheck,
    Truck,
    Sparkles,
    Package,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { apiClient } from '@/app/api/api-client';

const ORDER_STEPS = [
    { key: 'placed', label: 'Order Placed', icon: Clock },
    { key: 'processing', label: 'Curating & Packing', icon: PackageCheck },
    { key: 'dispatched', label: 'Dispatched', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrdersPage() {
    const { orders } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('auth_token');

            if (!token) {
                router.push('/signin');
                return;
            }

            try {
                await apiClient.get('/auth/profile');
                setLoading(false);
            } catch {
                localStorage.removeItem('auth_token');
                router.push('/signin');
            }
        };

        verifyAuth();
    }, [router]);

    const getActiveStepIndex = (order: any) => {
        const status = (order.status || 'placed').toLowerCase();

        if (status.includes('deliver')) return 3;
        if (status.includes('dispatch') || status.includes('shipped')) return 2;
        if (status.includes('process') || status.includes('pack')) return 1;

        return 0;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-(--color-background)">
                <div className="flex flex-col items-center gap-2">
                    <Loader2
                        size={24}
                        className="animate-spin text-(--color-gold-dark)"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">
                        Loading secure orders...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="box-border min-h-screen w-full bg-(--color-background) pb-16">
            <main className="mx-auto flex box-border w-full max-w-full flex-col gap-6 px-6 pt-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                        <Sparkles size={12} />
                        Your Order Tracking
                    </span>

                    <h1 className="text-2xl font-serif text-(--color-text)">
                        Purchase History &amp; Status
                    </h1>

                    <div className="inline-flex items-center gap-2.5 border border-(--color-border) bg-linear-to-r from-[#3d2c10] to-[#594018] px-4 py-2 text-white shadow-md shadow-[#3d2c10]/15">
                        <div className="flex h-6 w-6 items-center justify-center bg-white/10 text-(--color-gold-light)">
                            <Package size={13} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {orders.length}{' '}
                            {orders.length === 1
                                ? 'Active Curation'
                                : 'Active Curations'}{' '}
                            Recorded
                        </span>
                    </div>

                    <p className="max-w-md text-xs text-(--color-text-muted)">
                        Monitor the real-time progression of your luxury
                        skincare curations below.
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="flex w-full flex-col items-center justify-center border border-(--color-border-strong) bg-white p-10 text-center shadow-xs">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center border border-(--color-border) bg-(--color-surface) text-(--color-gold-dark)">
                            <PackageOpen size={28} />
                        </div>

                        <h2 className="mb-1 text-lg font-serif text-(--color-text)">
                            No orders yet
                        </h2>

                        <p className="mb-6 max-w-xs text-xs text-(--color-text-muted)">
                            Complete a checkout and your order tracking
                            history will appear here instantly.
                        </p>

                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3d2c10]/15 transition-all hover:brightness-105"
                        >
                            Shop collection
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {orders.map((order: any) => {
                            const activeStepIndex = getActiveStepIndex(order);

                            return (
                                <div
                                    key={order.id}
                                    className="space-y-6 border border-(--color-border-strong) bg-white p-6 shadow-xs"
                                >
                                    <div className="border-b border-(--color-border) pb-4">
                                        <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                                            Progression Status
                                        </span>

                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {ORDER_STEPS.map((step, idx) => {
                                                const isCompleted =
                                                    idx <= activeStepIndex;
                                                const isCurrent =
                                                    idx === activeStepIndex;
                                                const StepIcon = step.icon;

                                                return (
                                                    <div
                                                        key={step.key}
                                                        className={`relative flex flex-col items-center rounded-xs border p-3 text-center transition-all ${
                                                            isCurrent
                                                                ? 'border-(--color-gold)/60 bg-[rgba(216,181,109,0.045)] shadow-xs'
                                                                : isCompleted
                                                                    ? 'border-(--color-gold-dark)/60 bg-(--color-surface)'
                                                                    : 'border-(--color-border) bg-white opacity-50'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full border ${
                                                                isCurrent || isCompleted
                                                                    ? 'gold-foil border-transparent text-[#171108] shadow-xs'
                                                                    : 'border-(--color-border) bg-white text-(--color-text-muted)'
                                                            }`}
                                                        >
                                                            <StepIcon size={14} />
                                                        </div>

                                                        <span className="block text-[11px] font-bold leading-tight text-(--color-text)">
                                                            {step.label}
                                                        </span>

                                                        <span className="mt-0.5 text-[9px] text-(--color-text-muted)">
                                                            {isCompleted
                                                                ? isCurrent
                                                                    ? 'In Progress'
                                                                    : 'Completed'
                                                                : 'Pending'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start justify-between gap-3 border-b border-(--color-border) pb-4 sm:flex-row sm:items-center">
                                        <div>
                                            <span className="block font-mono text-xs font-bold text-(--color-text)">
                                                Order #{order.id}
                                            </span>
                                            <span className="block text-[10px] text-(--color-text-muted)">
                                                Recipient: {order.customerName}
                                            </span>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <span className="block text-xs font-bold text-(--color-gold-dark) sm:text-sm">
                                                R{Number(order.total).toFixed(2)}
                                            </span>
                                            <span className="block text-[10px] text-(--color-text-muted)">
                                                {new Date(
                                                    order.createdAt,
                                                ).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 border border-(--color-border) bg-(--color-background) p-4">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-(--color-text-muted)">
                                            Curated Items
                                        </span>

                                        {order.items.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between border-b border-(--color-border) py-1.5 text-xs last:border-b-0"
                                            >
                                                <span className="font-medium text-(--color-text)">
                                                    {item.name}
                                                </span>

                                                <div className="flex items-center gap-4">
                                                    <span className="font-semibold text-(--color-text-muted)">
                                                        x{item.quantity}
                                                    </span>

                                                    <span className="font-bold text-(--color-gold-dark)">
                                                        R
                                                        {(
                                                            item.price *
                                                            item.quantity
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
