import type { Metadata } from 'next';
import Link from 'next/link';

import PublicPageShell from '@/components/marketing/PublicPageShell';

export const metadata: Metadata = {
    title: 'About PulseHive',
    description:
        'Learn how PulseHive brings online orders, payment visibility and fulfilment operations together in one workspace.',
};

const capabilities = [
    {
        number: '01',
        title: 'Order management',
        description:
            'Bring customer orders and the details behind them into a shared operational view, from order placement through to delivery.',
    },
    {
        number: '02',
        title: 'Payment visibility',
        description:
            'See gateway payment records alongside their related orders, including transaction references and payment outcomes.',
    },
    {
        number: '03',
        title: 'Fulfilment workflows',
        description:
            'Follow fulfilment stages, capture delivery and tracking details, and keep operational exceptions visible to the team.',
    },
    {
        number: '04',
        title: 'Workspace control',
        description:
            'Keep business data organised by workspace, with team memberships and role-based access to operational areas.',
    },
];

const principles = [
    {
        title: 'Clarity over clutter',
        description:
            'The important details of an order should be easy to find: what was ordered, what has been paid, and what still needs attention.',
    },
    {
        title: 'Connected workflows',
        description:
            'Orders, payment activity and fulfilment belong in the same operational picture instead of being managed in disconnected places.',
    },
    {
        title: 'Control as you grow',
        description:
            'A workspace-based foundation helps businesses organise their teams and operations without losing sight of who can access what.',
    },
];

export default function AboutPage() {
    return (
        <PublicPageShell
            eyebrow="About PulseHive"
            title="The work behind every order, brought together."
            description="PulseHive is a commerce operations platform designed to help businesses manage the everyday work behind selling online — from customer orders and payment activity to fulfilment and team access."
        >
            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="ph-glass-panel p-6 sm:p-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        Why PulseHive
                    </p>
                    <h2 className="mt-4 max-w-2xl text-2xl font-black tracking-tight text-white sm:text-3xl">
                        Running an online business is more than taking an order.
                    </h2>
                    <p className="mt-5 text-sm leading-7 text-slate-400">
                        Every sale creates follow-up work. Someone needs to check
                        the order, confirm the payment, prepare the items, arrange
                        delivery and keep the customer informed. When those steps
                        live in separate tools, it becomes harder to see what is
                        complete and what needs attention.
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-400">
                        PulseHive brings these operational activities into a
                        shared workspace. The goal is straightforward: give
                        business owners and their teams a clearer view of the
                        work moving through the business.
                    </p>
                </div>

                <div className="relative isolate overflow-hidden rounded-2xl border border-indigo-400/15 bg-indigo-500/[0.06] p-6 sm:p-8">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        Our focus
                    </p>
                    <p className="mt-5 text-3xl font-black leading-tight tracking-tight text-white">
                        Move.
                        <span className="block text-indigo-300">Manage.</span>
                        <span className="block">Multiply.</span>
                    </p>
                    <p className="mt-5 text-sm leading-7 text-slate-400">
                        Practical tools for the day-to-day operation of an online
                        business, built around visibility, consistency and
                        controlled access.
                    </p>
                </div>
            </section>

            <section>
                <div className="mb-6 max-w-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        One operational picture
                    </p>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                        The core parts of online selling, working together.
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                        PulseHive brings the following capabilities into the
                        same workspace.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {capabilities.map((capability) => (
                        <article
                            key={capability.number}
                            className="ph-glass-panel p-6 transition-colors hover:border-indigo-400/20"
                        >
                            <span className="font-mono text-xs font-bold text-indigo-300">
                                {capability.number}
                            </span>
                            <h3 className="mt-4 text-lg font-bold text-white">
                                {capability.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                {capability.description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="ph-glass-panel p-6 sm:p-8">
                <div className="mb-7 max-w-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        How we think about the product
                    </p>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                        Useful first. More capable as your needs grow.
                    </h2>
                </div>

                <div className="grid gap-7 md:grid-cols-3">
                    {principles.map((principle) => (
                        <div key={principle.title}>
                            <h3 className="text-sm font-bold text-white">
                                {principle.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                {principle.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="flex flex-col justify-between gap-6 rounded-2xl border border-white/8 bg-white/[0.025] p-6 sm:flex-row sm:items-center sm:p-8">
                <div className="max-w-2xl">
                    <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                        See how PulseHive could fit your business.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Explore the available plan options or tell us about the
                        way your business operates.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/pricing"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/10"
                    >
                        View pricing
                    </Link>
                    <Link
                        href="/contact"
                        className="rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-500"
                    >
                        Contact us
                    </Link>
                </div>
            </section>
        </PublicPageShell>
    );
}
