'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    ArrowUpRight,
    Bot,
    Headset,
    MessageCircle,
    X,
} from 'lucide-react';
import { GlowaVeeLogo } from '@/components/glowa-vee-logo';

const exploreLinks = [
    { href: '/', label: 'Shop all' },
    { href: '/about', label: 'Our story' },
    { href: '/guides', label: 'Beauty guides' },
    { href: '/contact', label: 'Contact us' },
];

const customerLinks = [
    { href: '/signin', label: 'Sign in / Create account' },
    { href: '/refunds-cancellations-returns', label: 'Returns & refunds' },
    { href: '/privacy-policy', label: 'Privacy policy' },
    { href: '/terms-and-conditions', label: 'Terms & conditions' },
];

export function Footer() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const checkCustomerSession = () => {
            setIsLoggedIn(
                !!localStorage.getItem('customer_auth_token'),
            );
        };

        checkCustomerSession();

        window.addEventListener('storage', checkCustomerSession);

        return () => {
            window.removeEventListener('storage', checkCustomerSession);
        };
    }, [pathname]);

    useEffect(() => {
        if (!isChatOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsChatOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isChatOpen]);

    const visibleCustomerLinks = isLoggedIn
        ? customerLinks.filter(({ href }) => href !== '/signin')
        : customerLinks;

    return (
        <>
            <footer className="relative mt-16 w-full border-t border-(--color-border) bg-[linear-gradient(180deg,#11100d_0%,#090908_56%,#070707_100%)]">
                <div className="absolute inset-x-0 top-0 h-px gold-rule" />

                {/* Main footer content */}
                <div className="store-container grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16 lg:py-18">
                    {/* Brand */}
                    <div className="col-span-2 max-w-sm items-center text-center sm:text-left lg:col-span-1">
                        <Link
                            href="/"
                            aria-label="Glowa Vee home"
                            className="inline-flex"
                        >
                            <GlowaVeeLogo />
                        </Link>

                        <p className="mt-5 max-w-xs font-body text-[13px] leading-7 text-(--color-text-muted)">
                            A considered collection of skincare and cosmetics chosen to celebrate your natural glow.
                        </p>

                        <p className="mt-5 font-body text-sm font-semibold tracking-wide text-(--color-gold-light)">
                            Your glow. Your way.
                        </p>
                    </div>

                    {/* Explore */}
                    <div className="min-w-0">
                        <h2 className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-(--color-gold) sm:tracking-[0.25em]">
                            Explore
                        </h2>

                        <ul className="mt-5 space-y-3.5">
                            {exploreLinks.map(({ href, label }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="font-body text-[11px] leading-5 text-(--color-text-muted) transition-colors hover:text-(--color-gold-light) sm:text-[13px]"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer care */}
                    <div className="min-w-0">
                        <h2 className="font-body text-[9px] font-bold uppercase tracking-[0.16em] text-(--color-gold) sm:tracking-[0.25em]">
                            Customer care
                        </h2>

                        <ul className="mt-5 space-y-3.5">
                            {visibleCustomerLinks.map(({ href, label }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="font-body text-[11px] leading-5 text-(--color-text-muted) transition-colors hover:text-(--color-gold-light) sm:text-[13px]"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/5.5">
                    <div className="store-container flex flex-col items-center justify-between gap-2 py-5 text-center md:flex-row md:text-left">
                        <p className="font-body text-[9px] font-medium tracking-widest text-(--color-text-soft)">
                            &copy; {new Date().getFullYear()} Glowa Vee. All rights reserved.
                        </p>

                        <p className="font-body text-[9px] font-semibold uppercase tracking-[0.22em] text-(--color-text-soft)">
                            Skin Repair Products
                        </p>
                    </div>
                </div>
            </footer>

            {/* Fixed chat widget */}
            <div
                className="fixed z-[100] flex flex-col items-end"
                style={{
                    right: 'max(1.25rem, calc((100vw - 1440px) / 2 + 1.5rem))',
                    bottom: '5.5rem',
                }}
            >
                {/* Chat flyout */}
                {isChatOpen && (
                    <div className="mb-4 w-[min(340px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-(--color-gold)/25 bg-[#11100d] shadow-[0_12px_50px_rgba(0,0,0,0.65)]">
                        {/* Header */}
                        <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#211d15_0%,#11100d_100%)] px-5 py-5">
                            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-(--color-gold)/10 blur-2xl" />

                            <div className="relative flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-(--color-gold)/30 bg-(--color-gold)/10">
                                    <Headset
                                        size={21}
                                        className="text-(--color-gold-light)"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-body text-base font-semibold tracking-wide text-(--color-gold-light)">
                                        We're here to help
                                    </h3>

                                    <p className="mt-1 font-body text-xs leading-5 text-(--color-text-muted)">
                                        How would you like to connect with us?
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsChatOpen(false)}
                                    aria-label="Close chat menu"
                                    className="self-start rounded-full p-1.5 text-(--color-text-muted) transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        </div>

                        {/* Chat options */}
                        <div className="space-y-2 p-3">
                            <a
                                href="https://wa.me/27681037459"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsChatOpen(false)}
                                className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] p-3.5 transition-all hover:border-(--color-gold)/30 hover:bg-white/[0.07]"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#183d2b] text-[#65d99a]">
                                    <MessageCircle size={21} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="font-body text-sm font-semibold text-white">
                                        WhatsApp
                                    </p>
                                    <p className="mt-1 font-body text-[11px] text-(--color-text-muted)">
                                        Chat with our team
                                    </p>
                                </div>

                                <ArrowUpRight
                                    size={16}
                                    className="shrink-0 text-(--color-text-muted) transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--color-gold-light)"
                                />
                            </a>

                            <button
                                type="button"
                                disabled
                                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-left opacity-75"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-gold)/10 text-(--color-gold-light)">
                                    <Bot size={22} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="font-body text-sm font-semibold text-white">
                                        Ask Vee
                                    </p>
                                    <p className="mt-1 font-body text-[11px] text-(--color-text-muted)">
                                        Your personal beauty assistant
                                    </p>
                                </div>

                                <span className="shrink-0 rounded-full border border-(--color-gold)/25 px-2 py-1 font-body text-[8px] font-semibold uppercase tracking-wider text-(--color-gold-light)">
                                    Coming soon
                                </span>
                            </button>
                        </div>

                        <div className="border-t border-white/5 px-4 py-3 text-center">
                            <p className="font-body text-[9px] tracking-wide text-(--color-text-soft)">
                                Glowa Vee · Your glow. Your way.
                            </p>
                        </div>
                    </div>
                )}

                {/* Floating launcher */}
                <button
                    type="button"
                    onClick={() => setIsChatOpen((open) => !open)}
                    aria-label={isChatOpen ? 'Close chat menu' : 'Open chat menu'}
                    aria-expanded={isChatOpen}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-(--color-gold)/50 bg-(--color-gold) text-[#11100d] shadow-[0_5px_25px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
                >
                    {isChatOpen ? (
                        <X size={23} />
                    ) : (
                        <Headset size={24} />
                    )}
                </button>
            </div>
        </>
    );
}
