'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, UserRound, X } from 'lucide-react';
import { GlowaVeeLogo } from '@/components/glowa-vee-logo';
import { FloatingCart } from '@/components/floating-cart';

const links = [
    { href: '/', label: 'Shop' },
    { href: '/about', label: 'Our Story' },
    { href: '/guides', label: 'Beauty Guides' },
    { href: '/contact', label: 'Contact' },
];

export function NavBar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

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

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-(--color-border) bg-[#080807]/95 shadow-[0_14px_42px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                {/* Announcement strip */}
                <div className="flex h-8 items-center justify-center border-b border-[#a77d3d]/40 gold-foil px-4 text-center">
                    <span className="inline-flex items-center gap-2 font-body text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#171108] sm:text-[10px] sm:tracking-[0.22em]">
                        A considered destination for skincare &amp; beauty
                    </span>
                </div>

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
                        <Link
                            href="/account"
                            aria-label="My account"
                            className="hidden h-10 w-10 items-center justify-center rounded-full border border-(--color-border) bg-white/[0.018] text-(--color-text-muted) transition duration-200 hover:border-(--color-gold) hover:bg-[rgba(216,181,109,0.06)] hover:text-(--color-gold-light) sm:inline-flex"
                        >
                            <UserRound
                                size={17}
                                strokeWidth={1.6}
                            />
                        </Link>

                        {/* Mobile menu */}
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                            aria-controls="mobile-navigation"
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-white/[0.018] text-(--color-text) transition duration-200 hover:border-(--color-gold) hover:bg-[rgba(216,181,109,0.06)] hover:text-(--color-gold-light) sm:h-10 sm:w-10 lg:hidden"
                        >
                            <Menu
                                size={18}
                                strokeWidth={1.6}
                            />
                        </button>

                        {/* Shopping bag */}
                        <div className="flex shrink-0 items-center justify-center">
                            <FloatingCart />
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile navigation drawer */}
            {menuOpen && (
                <div className="fixed inset-0 z-[70] lg:hidden">
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
                                <X
                                    size={19}
                                    strokeWidth={1.6}
                                />
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

                            <Link
                                href="/account"
                                onClick={() => setMenuOpen(false)}
                                className="mt-7 flex items-center gap-3 border border-(--color-border) bg-white/[0.025] px-4 py-4 font-body text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted) transition hover:border-(--color-gold) hover:text-(--color-gold-light)"
                            >
                                <UserRound
                                    size={16}
                                    strokeWidth={1.6}
                                />
                                My account
                            </Link>
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
