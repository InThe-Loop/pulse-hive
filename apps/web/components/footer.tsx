import Link from 'next/link';
import { GlowaVeeLogo } from '@/components/glowa-vee-logo';

const exploreLinks = [
    { href: '/', label: 'Shop all' },
    { href: '/about', label: 'Our story' },
    { href: '/guides', label: 'Beauty guides' },
    { href: '/contact', label: 'Contact us' },
];

const customerLinks = [
    { href: '/orders', label: 'Order history' },
    { href: '/refunds-cancellations-returns', label: 'Returns & refunds' },
    { href: '/privacy-policy', label: 'Privacy policy' },
    { href: '/terms-and-conditions', label: 'Terms & conditions' },
];

export function Footer() {
    return (
        <footer className="relative mt-16 w-full border-t border-(--color-border) bg-[linear-gradient(180deg,#11100d_0%,#090908_56%,#070707_100%)]">
            <div className="absolute inset-x-0 top-0 h-px gold-rule" />

            {/* Main footer content */}
            <div className="store-container grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16 lg:py-18">

                {/* Brand */}
                <div className="col-span-2 max-w-sm lg:col-span-1 sm:text-left text-center items-center">
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
                        {customerLinks.map(({ href, label }) => (
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

            {/* Copyright — same alignment as navigation and homepage */}
            <div className="border-t border-white/5.5">
                <div className="store-container flex flex-col items-center justify-between gap-2 py-5 text-center md:flex-row md:text-left">
                    <p className="font-body text-[9px] font-medium tracking-widest text-(--color-text-soft)">
                        &copy; {new Date().getFullYear()} Glowa Vee Boutique. All rights reserved.
                    </p>

                    <p className="font-body text-[9px] font-semibold uppercase tracking-[0.22em] text-(--color-text-soft)">
                        Skin Repair Products
                    </p>
                </div>
            </div>
        </footer>
    );
}