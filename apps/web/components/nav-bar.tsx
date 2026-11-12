'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Menu,
    UserRound,
    LogIn,
    X,
    Package,
    LogOut,
    ArrowRight,
} from 'lucide-react';
import { GlowaVeeLogo } from '@/components/glowa-vee-logo';
import { FloatingCart } from '@/components/floating-cart';
import { customerApiClient } from '@/app/api/api-client';

const links = [
    { href: '/', label: 'Shop' },
    { href: '/about', label: 'Our Story' },
    { href: '/guides', label: 'Beauty Guides' },
    { href: '/contact', label: 'Contact' },
];

interface CustomerIdentity {
    id: string;
    phone: string;
}

export function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const accountMenuRef = useRef<HTMLDivElement>(null);

    const [menuOpen, setMenuOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [isCustomerAuthenticated, setIsCustomerAuthenticated] =
        useState(false);

    useEffect(() => {
        setMenuOpen(false);
        setAccountMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        let active = true;

        const verifyCustomerSession = async () => {
            const token = localStorage.getItem('customer_auth_token');

            if (!token) {
                if (active) {
                    setIsCustomerAuthenticated(false);
                }
                return;
            }

            try {
                await customerApiClient.get<CustomerIdentity>(
                    '/customer/auth/me'
                );

                if (active) {
                    setIsCustomerAuthenticated(true);
                }
            } catch {
                if (active) {
                    setIsCustomerAuthenticated(false);
                }
            }
        };

        verifyCustomerSession();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'customer_auth_token') {
                verifyCustomerSession();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            active = false;
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [pathname]);

    useEffect(() => {
        if (!accountMenuOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (
                accountMenuRef.current &&
                !accountMenuRef.current.contains(event.target as Node)
            ) {
                setAccountMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setAccountMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [accountMenuOpen]);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [menuOpen]);

    const isActive = (href: string) =>
        href === '/'
            ? pathname === '/'
            : pathname.startsWith(href);

    const signOut = () => {
        localStorage.removeItem('customer_auth_token');
        setIsCustomerAuthenticated(false);
        setAccountMenuOpen(false);
        setMenuOpen(false);
        router.replace('/');
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-(--color-border) bg-[#080807]/95 shadow-[0_14px_42px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                {/* Main navigation */}
                <div
                    className="mx-auto box-border flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-2 lg:h-[84px]"
                    style={{
                        paddingInline: 'var(--store-content-gutter)',
                    }}
                >
                    {/* Brand */}
                    <Link
                        href="/"
                        aria-label="Glowa Vee home"
                        className="min-w-0 shrink rounded-sm"
                    >
                        <GlowaVeeLogo />
                    </Link>

                    {/* Desktop navigation */}
                    <nav
                        aria-label="Main navigation"
                        className="hidden flex-1 items-center justify-center gap-7 lg:flex xl:gap-10"
                    >
                        {links.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                aria-current={
                                    isActive(href) ? 'page' : undefined
                                }
                                className={`group relative py-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ${
                                    isActive(href)
                                        ? 'text-(--color-gold-light)'
                                        : 'text-(--color-text-muted) hover:text-(--color-gold-highlight)'
                                }`}
                            >
                                {label}

                                <span
                                    className={`absolute inset-x-0 bottom-1 h-px origin-center bg-(--color-gold) transition-transform duration-300 ${
                                        isActive(href)
                                            ? 'scale-x-100'
                                            : 'scale-x-0 group-hover:scale-x-100'
                                    }`}
                                />
                            </Link>
                        ))}
                    </nav>

                    {/* Navigation actions */}
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        {isCustomerAuthenticated ? (
                            <div
                                ref={accountMenuRef}
                                className="relative hidden sm:block"
                                onMouseEnter={() => setAccountMenuOpen(true)}
                                onMouseLeave={() => setAccountMenuOpen(false)}
                            >
                                <button
                                    type="button"
                                    onClick={() => setAccountMenuOpen((open) => !open)}
                                    aria-label="Customer account menu"
                                    aria-haspopup="true"
                                    aria-expanded={accountMenuOpen}
                                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition duration-200 ${
                                        accountMenuOpen
                                            ? 'border-(--color-gold) bg-[rgba(216,181,109,0.08)] text-(--color-gold-light)'
                                            : 'border-(--color-border) bg-white/[0.018] text-(--color-text-muted) hover:border-(--color-gold) hover:bg-[rgba(216,181,109,0.06)] hover:text-(--color-gold-light)'
                                    }`}
                                >
                                    <UserRound size={17} strokeWidth={1.6} />
                                </button>

                                {accountMenuOpen && (
                                    <div className="absolute right-0 top-full z-[60] w-64 pt-3">
                                        <div className="relative overflow-hidden border border-(--color-border-strong) bg-[#100f0c] shadow-[0_20px_55px_rgba(0,0,0,0.65)]">
                                            <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                                            <div className="border-b border-white/[0.07] px-5 py-4">
                                                <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-(--color-gold)">
                                                    Your account
                                                </span>
                                            </div>

                                            <div className="p-2">
                                                <Link
                                                    href="/account"
                                                    onClick={() => setAccountMenuOpen(false)}
                                                    className="group flex items-center justify-between px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-(--color-text-muted) transition-colors hover:bg-white/[0.035] hover:text-(--color-gold-light)"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <UserRound size={15} />
                                                        My account
                                                    </span>
                                                    <ArrowRight
                                                        size={13}
                                                        className="text-(--color-text-muted) transition-transform group-hover:translate-x-1 group-hover:text-(--color-gold-light)"
                                                    />
                                                </Link>

                                                <Link
                                                    href="/orders"
                                                    onClick={() => setAccountMenuOpen(false)}
                                                    className="group flex items-center justify-between px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-(--color-text-muted) transition-colors hover:bg-white/[0.035] hover:text-(--color-gold-light)"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <Package size={15} />
                                                        My orders
                                                    </span>
                                                    <ArrowRight
                                                        size={13}
                                                        className="text-(--color-text-muted) transition-transform group-hover:translate-x-1 group-hover:text-(--color-gold-light)"
                                                    />
                                                </Link>

                                                <div className="my-2 border-t border-white/[0.07]" />

                                                <button
                                                    type="button"
                                                    onClick={signOut}
                                                    className="flex w-full items-center gap-3 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-(--color-text-muted) transition-colors hover:bg-white/[0.035] hover:text-red-300"
                                                >
                                                    <LogOut size={15} />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/signin"
                                aria-label="Sign in"
                                title="Sign in"
                                className="hidden h-10 w-10 items-center justify-center rounded-full border border-(--color-border) bg-white/[0.018] text-(--color-text-muted) transition duration-200 hover:border-(--color-gold) hover:bg-[rgba(216,181,109,0.06)] hover:text-(--color-gold-light) sm:inline-flex"
                            >
                                <LogIn size={17} strokeWidth={1.6} />
                            </Link>
                        )}

                        {/* Mobile menu */}
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                            aria-controls="mobile-navigation"
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-white/[0.018] text-(--color-text) transition duration-200 hover:border-(--color-gold) hover:bg-[rgba(216,181,109,0.06)] hover:text-(--color-gold-light) sm:h-10 sm:w-10 lg:hidden"
                        >
                            <Menu size={18} strokeWidth={1.6} />
                        </button>

                        {/* Shopping bag */}
                        <div className="flex shrink-0 items-center justify-center">
                            <FloatingCart />
                        </div>
                    </div>
                </div>

                {/* Announcement strip */}
                <div className="flex h-8 items-center justify-center border-b border-[#a77d3d]/40 gold-foil px-4 text-center">
                    <span className="inline-flex items-center gap-2 font-body text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#171108] sm:text-[10px] sm:tracking-[0.22em]">
                        A considered destination for skincare &amp; beauty
                    </span>
                </div>
            </header>

            {/* Mobile navigation drawer */}
            {menuOpen && (
                <div className="fixed inset-0 z-70 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close navigation menu"
                        onClick={() => setMenuOpen(false)}
                        className="absolute inset-0 h-full w-full cursor-default bg-black/80 backdrop-blur-md"
                    />

                    <aside
                        id="mobile-navigation"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation"
                        className="absolute inset-y-0 right-0 flex h-full w-[min(88vw,390px)] flex-col overflow-hidden border-l border-(--color-border-strong) bg-[#0b0a08] shadow-[-28px_0_80px_rgba(0,0,0,0.62)]"
                    >
                        <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                        <div className="flex h-20 items-center justify-between border-b border-white/6.5 px-5">
                            <GlowaVeeLogo />

                            <button
                                type="button"
                                onClick={() => setMenuOpen(false)}
                                aria-label="Close navigation menu"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-muted) transition hover:border-(--color-gold) hover:text-(--color-gold-light)"
                            >
                                <X size={19} strokeWidth={1.6} />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-5 py-8">
                            <p className="gold-kicker mb-5">
                                Explore Glowa Vee
                            </p>

                            <div className="flex flex-col">
                                {links.map(({ href, label }, index) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMenuOpen(false)}
                                        aria-current={
                                            isActive(href)
                                                ? 'page'
                                                : undefined
                                        }
                                        className={`flex items-center justify-between border-b border-white/[0.075] py-5 font-body text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${
                                            isActive(href)
                                                ? 'text-(--color-gold-light)'
                                                : 'text-(--color-text) hover:text-(--color-gold-light)'
                                        }`}
                                    >
                                        <span>{label}</span>

                                        <span className="font-body text-[9px] font-semibold tracking-[0.16em] text-(--color-text-soft)">
                                            0{index + 1}
                                        </span>
                                    </Link>
                                ))}
                            </div>

                            {isCustomerAuthenticated ? (
                                <div className="mt-8 border border-(--color-border) bg-white/[0.018]">
                                    <div className="border-b border-white/[0.07] px-4 py-4">
                                        <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-(--color-gold)">
                                            Your account
                                        </span>
                                    </div>

                                    <Link
                                        href="/account"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-(--color-text-muted) transition hover:text-(--color-gold-light)"
                                    >
                                        <UserRound size={16} />
                                        My account
                                    </Link>

                                    <Link
                                        href="/orders"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 border-t border-white/[0.06] px-4 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-(--color-text-muted) transition hover:text-(--color-gold-light)"
                                    >
                                        <Package size={16} />
                                        My orders
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={signOut}
                                        className="flex w-full items-center gap-3 border-t border-white/[0.06] px-4 py-4 text-left font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-(--color-text-muted) transition hover:text-red-300"
                                    >
                                        <LogOut size={16} />
                                        Sign out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/signin"
                                    onClick={() => setMenuOpen(false)}
                                    className="mt-8 flex items-center justify-between border border-(--color-gold)/40 bg-(--color-gold)/[0.04] px-4 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-gold-light) transition hover:border-(--color-gold) hover:bg-(--color-gold)/[0.1]"
                                >
                                    <span className="flex items-center gap-3">
                                        <LogIn size={16} />
                                        Sign in / Create account
                                    </span>
                                    <ArrowRight size={14} />
                                </Link>
                            )}
                        </nav>

                        <div className="border-t border-white/[0.07] bg-white/[0.012] px-5 py-6">
                            <p className="font-body text-sm font-semibold tracking-wide text-(--color-gold-light)">
                                Your glow. Your way.
                            </p>

                            <p className="mt-1.5 font-body text-[9px] font-semibold uppercase tracking-[0.22em] text-(--color-text-soft)">
                                Beauty &amp; skincare
                            </p>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
