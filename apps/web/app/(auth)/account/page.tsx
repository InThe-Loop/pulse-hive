'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    User,
    Package,
    MapPin,
    LogOut,
    ArrowRight,
    ShieldCheck,
    Loader2,
    Award,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { apiClient } from '@/app/api/api-client';

interface UserProfile {
    email: string;
    displayName?: string;
    role: string;
}

export default function AccountPage() {
    const { orders } = useCart();
    const router = useRouter();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('auth_token');

            if (!token) {
                router.push('/signin');
                return;
            }

            try {
                const data = await apiClient.get<UserProfile>(
                    '/auth/profile',
                );

                setUser(data);
            } catch {
                localStorage.removeItem('auth_token');
                router.push('/signin');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        router.push('/signin');
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center bg-(--color-background)">
                <div className="flex flex-col items-center gap-3">
                    <Loader2
                        size={25}
                        className="animate-spin text-(--color-gold)"
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-text-muted)">
                        Loading account
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-(--color-background) pb-16 text-(--color-text)">
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 pt-10 sm:px-6 sm:pt-14">
                {/* PAGE INTRODUCTION */}

                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-(--color-gold)/25 bg-(--color-gold)/6 text-(--color-gold)">
                        <User size={22} strokeWidth={1.5} />
                    </div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-(--color-gold)">
                        Glowa Vee Client Portal
                    </p>

                    <h1 className="font-display text-3xl font-semibold tracking-tight text-(--color-text) sm:text-4xl">
                        {user?.displayName
                            ? `Welcome back, ${user.displayName}`
                            : 'My Account'}
                    </h1>

                    <p className="text-xs text-(--color-text-muted)">
                        {user?.email}
                    </p>

                    <p className="mt-1 max-w-lg text-xs leading-relaxed text-(--color-text-soft)">
                        Manage your profile, explore your order history
                        and keep track of your Glowa Vee experience.
                    </p>
                </div>

                {/* ACCOUNT CONTENT */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.65fr)]">
                    {/* ACCOUNT SUMMARY */}

                    <section className="relative overflow-hidden border border-(--color-border-strong) bg-[linear-gradient(155deg,#191713_0%,#12110f_55%,#0d0d0c_100%)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] sm:p-6">
                        <div className="absolute inset-x-0 top-0 h-px gold-foil opacity-70" />

                        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-(--color-gold)">
                            Account overview
                        </p>

                        <h2 className="mt-2 font-display text-xl font-semibold text-(--color-text)">
                            Your Membership
                        </h2>

                        <div className="mt-6 divide-y divide-(--color-border)">
                            <div className="py-4 first:pt-0">
                                <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-(--color-text-soft)">
                                    Total orders
                                </span>

                                <span className="mt-1 block font-display text-2xl font-semibold text-(--color-text)">
                                    {orders.length}
                                </span>

                                <span className="text-[10px] text-(--color-text-muted)">
                                    {orders.length === 1
                                        ? 'Order placed'
                                        : 'Orders placed'}
                                </span>
                            </div>

                            <div className="py-4">
                                <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-(--color-text-soft)">
                                    Reward standing
                                </span>

                                <span className="mt-1 block font-display text-lg font-medium text-(--color-gold-light)">
                                    Glow Tier 1
                                </span>
                            </div>

                            <div className="py-4 last:pb-0">
                                <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-(--color-text-soft)">
                                    Concierge access
                                </span>

                                <span className="mt-1 block font-display text-lg font-medium text-(--color-text)">
                                    Priority 24/7
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* ACCOUNT NAVIGATION */}

                    <section className="border border-(--color-border-strong) bg-(--color-surface-elevated)/70 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
                        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-(--color-gold)">
                            Your account
                        </p>

                        <h2 className="mt-2 font-display text-xl font-semibold text-(--color-text)">
                            Navigation & Settings
                        </h2>

                        <div className="mt-5 space-y-3">
                            <Link
                                href="/orders"
                                className="group flex items-center justify-between gap-3 border border-(--color-border) bg-(--color-surface)/70 p-4 transition-all duration-200 hover:border-(--color-gold)/50 hover:bg-(--color-gold)/5"
                            >
                                <div className="flex min-w-0 items-center gap-3.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-(--color-border-strong) bg-(--color-background) text-(--color-gold)">
                                        <Package size={18} />
                                    </div>

                                    <div className="min-w-0">
                                        <span className="block text-xs font-semibold text-(--color-text) transition-colors group-hover:text-(--color-gold-light) sm:text-sm">
                                            Order History
                                        </span>

                                        <span className="mt-1 block text-[10px] leading-relaxed text-(--color-text-muted)">
                                            Track active shipments and past purchases
                                        </span>
                                    </div>
                                </div>

                                <ArrowRight
                                    size={16}
                                    className="shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-1 group-hover:text-(--color-gold)"
                                />
                            </Link>

                            <div className="flex items-center justify-between gap-3 border border-(--color-border) bg-(--color-surface)/70 p-4">
                                <div className="flex min-w-0 items-center gap-3.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-(--color-border-strong) bg-(--color-background) text-(--color-gold)">
                                        <MapPin size={18} />
                                    </div>

                                    <div className="min-w-0">
                                        <span className="block text-xs font-semibold text-(--color-text) sm:text-sm">
                                            Saved Delivery Addresses
                                        </span>

                                        <span className="mt-1 block text-[10px] leading-relaxed text-(--color-text-muted)">
                                            Manage your primary shipping destinations
                                        </span>
                                    </div>
                                </div>

                                <span className="shrink-0 border border-(--color-border) bg-(--color-background) px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-(--color-gold-light)">
                                    Active
                                </span>
                            </div>

                            <Link
                                href="/contact"
                                className="group flex items-center justify-between gap-3 border border-(--color-border) bg-(--color-surface)/70 p-4 transition-all duration-200 hover:border-(--color-gold)/50 hover:bg-(--color-gold)/5"
                            >
                                <div className="flex min-w-0 items-center gap-3.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-(--color-border-strong) bg-(--color-background) text-(--color-gold)">
                                        <Award size={18} />
                                    </div>

                                    <div className="min-w-0">
                                        <span className="block text-xs font-semibold text-(--color-text) transition-colors group-hover:text-(--color-gold-light) sm:text-sm">
                                            Skin Consultation & Support
                                        </span>

                                        <span className="mt-1 block text-[10px] leading-relaxed text-(--color-text-muted)">
                                            Connect with our beauty concierge team
                                        </span>
                                    </div>
                                </div>

                                <ArrowRight
                                    size={16}
                                    className="shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-1 group-hover:text-(--color-gold)"
                                />
                            </Link>
                        </div>

                        {/* LOGOUT */}

                        <div className="mt-6 border-t border-(--color-border) pt-5">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="button-gold inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 text-[10px] font-bold uppercase tracking-[0.16em]"
                            >
                                Log out of account
                                <LogOut size={14} />
                            </button>
                        </div>
                    </section>
                </div>

                {/* SECURITY INDICATOR */}

                <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-(--color-text-muted)">
                    <ShieldCheck
                        size={14}
                        className="text-(--color-gold)"
                    />

                    <span>
                        Your client profile is protected and secure
                    </span>
                </div>
            </main>
        </div>
    );
}
