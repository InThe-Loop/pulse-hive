'use client';

import { ShieldCheck, FileText, RotateCcw } from 'lucide-react';

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
    const Icon = icons[icon];

    return (
        <div className="min-h-screen w-full bg-(--color-background) pb-12">
            <main className="mx-auto w-full max-w-[1440px] px-5 pt-6 sm:px-6 sm:pt-8">
                {/* Page Header */}
                <div className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-8 sm:px-10 sm:py-9">
                    <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                    <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />

                    <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2">
                            <Icon
                                size={15}
                                className="text-(--color-gold-light)"
                            />

                            <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                                {eyebrow}
                            </span>
                        </div>

                        <h1 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl">
                            {title}
                        </h1>

                        <p className="mt-3 max-w-xl font-body text-xs leading-6 text-white/60 sm:text-sm">
                            {description}
                        </p>
                    </div>
                </div>

                {/* Policy Sections */}
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <section
                            key={index}
                            className="border border-(--color-border-strong) bg-(--color-surface)/70 p-5 sm:p-7"
                        >
                            <h2 className="border-b border-(--color-border) pb-3 font-body text-xs font-bold uppercase tracking-[0.15em] text-(--color-gold-light) sm:text-sm">
                                <span className="mr-2 text-(--color-gold-dark)">
                                    {String(index + 1).padStart(2, '0')}.
                                </span>
                                {section.title}
                            </h2>

                            <div className="mt-4 max-w-5xl space-y-3">
                                {section.content?.map((paragraph, paragraphIndex) => (
                                    <p
                                        key={paragraphIndex}
                                        className="font-body text-xs leading-7 text-(--color-text-muted) sm:text-sm"
                                    >
                                        {paragraph}
                                    </p>
                                ))}

                                {section.bullets && (
                                    <ul className="space-y-2.5 pt-1">
                                        {section.bullets.map((bullet, bulletIndex) => (
                                            <li
                                                key={bulletIndex}
                                                className="flex items-start gap-3 font-body text-xs leading-6 text-(--color-text-muted) sm:text-sm"
                                            >
                                                <span className="mt-0.5 text-(--color-gold)">
                                                    •
                                                </span>

                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Business Information */}
                <section className="relative mt-6 overflow-hidden border border-(--color-border-strong) bg-[linear-gradient(135deg,#181613_0%,#100f0d_65%,#0b0b0a_100%)] p-5 sm:p-7">
                    <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                    <div className="relative z-10">
                        <h2 className="border-b border-(--color-border) pb-3 font-body text-xs font-bold uppercase tracking-[0.15em] text-(--color-gold-light) sm:text-sm">
                            Business Information
                        </h2>

                        <div className="mt-4 space-y-2 font-body text-xs leading-6 text-(--color-text-muted) sm:text-sm">
                            <p className="font-semibold text-(--color-text)">
                                MISSVEE TMI GROUP (PTY) LTD
                            </p>

                            <p>Trading as Glowa Vee</p>

                            <p>19 11th Ave, Northmead, Benoni, 1501</p>

                            <p>
                                Telephone: (+27) 68 103 7459
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
