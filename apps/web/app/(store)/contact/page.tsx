'use client';

import Link from 'next/link';
import {
    ArrowUpRight,
    BriefcaseBusiness,
    Handshake,
    Mail,
    MapPin,
    PhoneCall,
    Headset,
    Store,
} from 'lucide-react';

const businessEnquiries = [
    {
        icon: Store,
        title: 'Wholesale & Resellers',
        description:
            'Interested in stocking Glowa Vee products or becoming an authorised reseller? We would love to hear from you.',
    },
    {
        icon: Handshake,
        title: 'Partnerships & Collaborations',
        description:
            'For brand partnerships, collaborations, marketing opportunities and other commercial proposals.',
    },
    {
        icon: BriefcaseBusiness,
        title: 'General Business Enquiries',
        description:
            'For suppliers, business proposals, corporate enquiries and other professional correspondence.',
    },
];

export default function ContactPage() {
    return (
        <div className="min-h-screen w-full bg-(--color-background) pb-12">
            <main className="mx-auto w-full max-w-[1440px] px-5 pt-6 sm:px-6 sm:pt-8">
                <div className="space-y-6">

                    {/* Business contact header */}
                    <div className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-8 sm:px-10 sm:py-9">
                        <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />
                        <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

                        <div className="relative z-10">
                            <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                                Let's Work Together
                            </span>

                            <h1 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl">
                                Business Enquiries
                            </h1>

                            <p className="mt-3 max-w-xl font-body text-xs leading-6 text-white/60 sm:text-sm">
                                We welcome meaningful partnerships, wholesale opportunities
                                and business conversations. Connect with Glowa Vee and let's
                                explore what we can create together.
                            </p>
                        </div>
                    </div>

                    {/* Business enquiry categories */}
                    <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {businessEnquiries.map((item) => {
                            const Icon = item.icon;

                            return (
                                <article
                                    key={item.title}
                                    className="relative border border-(--color-border-strong) border-t-2 border-t-(--color-gold) bg-(--color-surface) p-6 sm:p-8"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-(--color-border) bg-(--color-background) text-(--color-gold-dark)">
                                        <Icon size={19} />
                                    </div>

                                    <h2 className="mt-6 font-serif text-lg text-(--color-text)">
                                        {item.title}
                                    </h2>

                                    <p className="mt-3 font-body text-xs leading-6 text-(--color-text-muted)">
                                        {item.description}
                                    </p>
                                </article>
                            );
                        })}
                    </section>

                    {/* Business contact details */}
                    <section className="grid grid-cols-1 gap-6 border border-(--color-border-strong) bg-(--color-surface) p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:p-10">
                        <div>
                            <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                                Get in Touch
                            </span>

                            <h2 className="mt-3 font-serif text-xl text-(--color-text) sm:text-2xl">
                                Let's start a conversation.
                            </h2>

                            <p className="mt-3 max-w-lg font-body text-xs leading-6 text-(--color-text-muted)">
                                For business proposals, wholesale enquiries
                                and partnership opportunities, reach our
                                team directly. Please include a brief
                                introduction and details of your enquiry.
                            </p>

                            <a
                                href="mailto:info@glowavee.store"
                                className="mt-7 inline-flex items-center gap-3 border-b border-(--color-gold) pb-2 font-body text-sm font-semibold text-(--color-text) transition-colors hover:text-(--color-gold-dark)"
                            >
                                <Mail size={17} className="text-(--color-gold-dark)" />
                                info@glowavee.store
                                <ArrowUpRight size={15} className="text-(--color-gold-dark)" />
                            </a>
                        </div>

                        <div className="space-y-6 border-t border-(--color-border) pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-(--color-background) text-(--color-gold-dark)">
                                    <PhoneCall size={17} />
                                </div>

                                <div>
                                    <span className="block font-body text-[10px] font-bold uppercase tracking-wider text-(--color-text-muted)">
                                        Telephone
                                    </span>

                                    <a
                                        href="tel:+27681037459"
                                        className="mt-1 block font-body text-sm text-(--color-text) transition-colors hover:text-(--color-gold-dark)"
                                    >
                                        +27 (0) 68 103 7459
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-(--color-background) text-(--color-gold-dark)">
                                    <MapPin size={17} />
                                </div>

                                <div>
                                    <span className="block font-body text-[10px] font-bold uppercase tracking-wider text-(--color-text-muted)">
                                        Location
                                    </span>

                                    <p className="mt-1 font-body text-sm leading-6 text-(--color-text)">
                                        19 11th Ave, Northmead,
                                        Benoni, South Africa
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Customer support direction */}
                    <section className="flex flex-col gap-5 border border-(--color-border) bg-(--color-surface) p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-(--color-background) text-(--color-gold-dark)">
                                <Headset size={19} />
                            </div>

                            <div>
                                <h2 className="font-serif text-base text-(--color-text)">
                                    Looking for customer support?
                                </h2>

                                <p className="mt-1 max-w-xl font-body text-xs leading-6 text-(--color-text-muted)">
                                    For order enquiries, product guidance
                                    and general assistance, our concierge
                                    team is available through the floating
                                    support icon.
                                </p>
                            </div>
                        </div>

                        <p className="shrink-0 font-body text-[10px] font-bold uppercase tracking-wider text-(--color-gold-dark)">
                            Your glow. Your way.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
