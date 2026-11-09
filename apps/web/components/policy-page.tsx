'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingCart, FileText, ShieldCheck, RotateCcw } from 'lucide-react';
import { useCart } from '@/context/cart-context';

type Section = {
    title: string;
    content?: string[];
    bullets?: string[];
};

type PolicyPageProps = {
    eyebrow: string;
    title: string;
    description: string;
    icon: 'terms' | 'privacy' | 'refund';
    sections: Section[];
};

const icons = {
    terms: FileText,
    privacy: ShieldCheck,
    refund: RotateCcw,
};

export function PolicyPage({
    eyebrow,
    title,
    description,
    icon,
    sections,
}: PolicyPageProps) {
    const { cart } = useCart();
    const Icon = icons[icon];

    return (
        <div className="w-full min-h-screen bg-(--color-background) pb-12">
            <main className="flex flex-col gap-6 px-6 pt-6 pb-16">
                {/* Page Title */}
                <div className="flex flex-col gap-1 items-center text-center">
                    <div className="w-12 h-12 flex items-center justify-center text-(--color-gold-dark) mb-2 rounded-full border border-(--color-border)">
                        <Icon size={20} />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                        {eyebrow}
                    </span>

                    <h1 className="text-2xl font-serif text-(--color-text)">
                        {title}
                    </h1>

                    <p className="text-xs text-(--color-text-muted) max-w-sm">
                        {description}
                    </p>
                </div>

                {/* Policy Sections */}
                <div className="flex flex-col gap-3 items-center text-center">
                    {sections.map((section, index) => (
                        <section
                            key={index}
                            className="border border-(--color-border-strong) p-5 shadow-xs space-y-3"
                        >
                            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-(--color-text) pb-3 border-b border-(--color-border)">
                                {index + 1}. {section.title}
                            </h2>

                            {section.content?.map((paragraph, paragraphIndex) => (
                                <p
                                    key={paragraphIndex}
                                    className="text-xs sm:text-sm leading-6 text-(--color-text) font-medium"
                                >
                                    {paragraph}
                                </p>
                            ))}

                            {section.bullets && (
                                <ul className="space-y-2.5">
                                    {section.bullets.map((bullet, bulletIndex) => (
                                        <li
                                            key={bulletIndex}
                                            className="flex gap-3 text-xs sm:text-sm leading-6 text-(--color-text)"
                                        >
                                            <span className="font-bold text-(--color-gold-dark)">
                                                •
                                            </span>

                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>

                {/* Business Details */}
                <div className="border border-(--color-border-strong) p-5 shadow-xs text-center">
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-(--color-text) pb-3 border-b border-(--color-border) mb-3">
                        Business Information
                    </h2>

                    <div className="space-y-2 text-xs sm:text-sm text-(--color-text-muted)">
                        <p>
                            <strong className="text-(--color-text)">
                                MISSVEE TMI GROUP (PTY) LTD
                            </strong>
                        </p>

                        <p>Trading as Glowa Vee Boutique</p>

                        <p>19 11th Ave, Northmead, Benoni, 1501</p>

                        <p>
                            WhatsApp:{' '}
                            <a
                                href="https://wa.me/27681037459"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-(--color-gold-dark) font-semibold"
                            >
                                +27 68 103 7459
                            </a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}