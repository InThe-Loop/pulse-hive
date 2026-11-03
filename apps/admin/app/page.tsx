import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'PulseHive | Commerce Operations, Connected',
    description:
        'Manage online orders, customer payments and fulfilment in one workspace. PulseHive helps South African businesses bring their commerce operations together.',
};

const capabilities = [
    {
        number: '01',
        eyebrow: 'SELL',
        title: 'Bring your sales online.',
        description:
            'Manage your products, customer orders and online checkout through a connected commerce workflow.',
        icon: 'store',
    },
    {
        number: '02',
        eyebrow: 'MANAGE',
        title: 'Keep every order in view.',
        description:
            'See customer details, order items, payment status and operational activity from one place.',
        icon: 'shopping-bag',
    },
    {
        number: '03',
        eyebrow: 'FULFIL',
        title: 'Move orders towards delivery.',
        description:
            'Track fulfilment stages, capture delivery information and keep exceptions visible to your team.',
        icon: 'truck',
    },
    {
        number: '04',
        eyebrow: 'UNDERSTAND',
        title: 'See what is happening.',
        description:
            'Review gateway payment records alongside orders and identify outstanding balances that need attention.',
        icon: 'chart',
    },
];

const workflowSteps = [
    {
        number: '01',
        title: 'An order is received',
        detail: 'Customer and order details are captured.',
        tone: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300',
    },
    {
        number: '02',
        title: 'Payment is recorded',
        detail: 'Gateway status and transaction references are available.',
        tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    },
    {
        number: '03',
        title: 'Fulfilment progresses',
        detail: 'The team updates preparation and delivery stages.',
        tone: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
    },
    {
        number: '04',
        title: 'Operations stay visible',
        detail: 'Owners and teams can see what is complete and what needs attention.',
        tone: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
    },
];

const plans = [
    {
        id: 'essentials',
        name: 'Essentials',
        price: 'R249',
        description: 'For businesses getting started with organised online sales.',
        allowance: '1 workspace · 2 team members · 100 orders/month',
        featured: false,
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 'R599',
        description: 'For growing businesses coordinating orders and fulfilment.',
        allowance: '1 workspace · 5 team members · 500 orders/month',
        featured: true,
    },
    {
        id: 'scale',
        name: 'Scale',
        price: 'R1,199',
        description: 'For established teams managing higher order volumes.',
        allowance: '1 workspace · 15 team members · 2,000 orders/month',
        featured: false,
    },
];

function ArrowIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
        >
            <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CapabilityIcon({ type }: { type: string }) {
    const common = {
        className: 'h-6 w-6',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
    };

    switch (type) {
        case 'store':
            return (
                <svg viewBox="0 0 24 24" {...common}>
                    <path d="M3 10v10h18V10M3 10l2-7h14l2 7" />
                    <path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 20v-6h6v6" />
                </svg>
            );

        case 'shopping-bag':
            return (
                <svg viewBox="0 0 24 24" {...common}>
                    <path d="M5 8h14l1 13H4L5 8Z" />
                    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                    <path d="M9 12v1m6-1v1" />
                </svg>
            );

        case 'truck':
            return (
                <svg viewBox="0 0 24 24" {...common}>
                    <path d="M3 6h11v12H3zM14 10h4l3 3v5h-7" />
                    <circle cx="7.5" cy="18" r="2" />
                    <circle cx="17.5" cy="18" r="2" />
                </svg>
            );

        default:
            return (
                <svg viewBox="0 0 24 24" {...common}>
                    <path d="M4 19V5m0 14h16" />
                    <path d="m7 15 4-4 3 2 5-6" />
                    <path d="M15 7h4v4" />
                </svg>
            );
    }
}

function CapabilityCard({
    capability,
}: {
    capability: (typeof capabilities)[number];
}) {
    return (
        <article className="ph-glass-panel group p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/20">
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07] text-indigo-300">
                    <CapabilityIcon type={capability.icon} />
                </div>

                <span className="font-mono text-[10px] font-bold text-slate-600">
                    {capability.number}
                </span>
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                {capability.eyebrow}
            </p>

            <h3 className="mt-2 text-lg font-bold tracking-tight text-white">
                {capability.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
                {capability.description}
            </p>
        </article>
    );
}

export default function LandingPage() {
    return (
        <div className="relative isolate w-full overflow-hidden bg-slate-950 font-sans text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[32px_32px]"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-48 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-[900px] -z-10 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[120px]"
            />

            <div className="relative z-10 mx-auto w-full max-w-8xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
                {/* Hero */}
                <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.07] px-3 py-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200">
                                Commerce operations, connected
                            </span>
                        </div>

                        <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                            Run your online business from{' '}
                            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-sky-300 bg-clip-text text-transparent">
                                one clear workspace.
                            </span>
                        </h1>

                        <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                            From customer orders and payment visibility to
                            fulfilment and team operations, PulseHive brings
                            the work behind every sale together.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 active:scale-[0.98]"
                            >
                                Explore plans
                                <ArrowIcon />
                            </Link>

                            <Link
                                href="/auth/login"
                                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
                            >
                                Open your workspace
                            </Link>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Built for growing businesses
                            </span>

                            <span className="inline-flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                Workspace-based operations
                            </span>
                        </div>
                    </div>

                    {/* Illustrative workflow panel */}
                    <div className="relative">
                        <div
                            aria-hidden="true"
                            className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-400/[0.06] blur-2xl"
                        />

                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
                            <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                                        The PulseHive workflow
                                    </p>

                                    <h2 className="mt-1 text-lg font-bold text-white">
                                        From sale to fulfilment
                                    </h2>
                                </div>

                                <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                                    Connected
                                </span>
                            </div>

                            <div className="space-y-3 pt-5">
                                {workflowSteps.map((step, index) => (
                                    <div
                                        key={step.number}
                                        className="relative flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-bold ${step.tone}`}
                                            >
                                                {step.number}
                                            </span>

                                            {index < workflowSteps.length - 1 && (
                                                <span className="mt-2 h-5 w-px bg-gradient-to-b from-white/15 to-transparent" />
                                            )}
                                        </div>

                                        <div className="min-w-0 pt-0.5">
                                            <h3 className="text-sm font-bold text-white">
                                                {step.title}
                                            </h3>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {step.detail}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="mt-5 text-center text-[10px] leading-5 text-slate-600">
                                An overview of the connected workflow, not a live
                                transaction feed.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Platform value strip */}
                <section className="mt-20 grid gap-4 border-y border-white/8 py-7 sm:grid-cols-3 sm:gap-8">
                    <div>
                        <p className="text-sm font-bold text-white">
                            One operational workspace
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Keep the important parts of selling connected.
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-white">
                            Built around your team
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Organise access and responsibilities by workspace.
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-emerald-300">
                            0% additional sales commission
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            PulseHive does not add a commission to your sales.
                        </p>
                    </div>
                </section>

                {/* Capabilities */}
                <section id="platform" className="scroll-mt-24 pt-20 sm:pt-24">
                    <div className="mx-auto mb-10 max-w-2xl text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                            One connected platform
                        </p>

                        <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            More than an online storefront.
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                            Selling is only the beginning. PulseHive helps
                            bring the daily operations that follow each sale
                            into the same view.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {capabilities.map((capability) => (
                            <CapabilityCard
                                key={capability.number}
                                capability={capability}
                            />
                        ))}
                    </div>
                </section>

                {/* No additional commission */}
                <section className="mt-20 overflow-hidden rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.07] via-slate-900/70 to-slate-900/70 p-6 sm:mt-24 sm:p-10">
                    <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                        <div className="max-w-2xl">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                                Straightforward platform pricing
                            </p>

                            <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                Your sales are yours. No extra PulseHive
                                transaction commission.
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-400">
                                Choose a predictable monthly subscription.
                                Your payment provider may still charge its own
                                processing fees, but PulseHive does not add a
                                percentage commission on top of your sales.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/50 px-7 py-6 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                                PulseHive commission
                            </p>

                            <p className="mt-2 font-mono text-5xl font-black tracking-tight text-white">
                                0%
                            </p>

                            <p className="mt-2 text-[10px] text-slate-500">
                                Payment-provider fees are separate
                            </p>
                        </div>
                    </div>
                </section>

                {/* Pricing preview */}
                <section id="plans" className="scroll-mt-24 pt-20 sm:pt-24">
                    <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div className="max-w-2xl">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                                Simple monthly plans
                            </p>

                            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                                Room to grow with your business.
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-400">
                                Start with what you need today. Move to a
                                larger plan as your team and order activity
                                grow.
                            </p>
                        </div>

                        <Link
                            href="/pricing"
                            className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-indigo-300 transition hover:text-indigo-200"
                        >
                            Compare all plans
                            <ArrowIcon />
                        </Link>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <article
                                key={plan.id}
                                className={`flex flex-col rounded-2xl border p-6 ${
                                    plan.featured
                                        ? 'border-indigo-400/35 bg-indigo-500/[0.07] shadow-xl shadow-indigo-950/20'
                                        : 'border-white/8 bg-white/[0.025]'
                                }`}
                            >
                                {plan.featured && (
                                    <span className="mb-4 self-start rounded-full border border-indigo-400/25 bg-indigo-400/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-indigo-200">
                                        Recommended
                                    </span>
                                )}

                                <h3 className="text-lg font-black text-white">
                                    {plan.name}
                                </h3>

                                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">
                                    {plan.description}
                                </p>

                                <p className="mt-5">
                                    <span className="font-mono text-3xl font-black tracking-tight text-white">
                                        {plan.price}
                                    </span>

                                    <span className="ml-2 text-xs text-slate-500">
                                        / workspace / month
                                    </span>
                                </p>

                                <div className="mt-5 border-t border-white/8 pt-4">
                                    <p className="text-[10px] leading-5 text-slate-400">
                                        {plan.allowance}
                                    </p>
                                </div>

                                <Link
                                    href={`/pricing#${plan.id}`}
                                    className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-bold transition ${
                                        plan.featured
                                            ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                                            : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                                    }`}
                                >
                                    View plan details
                                </Link>
                            </article>
                        ))}
                    </div>

                    <p className="mt-5 text-center text-[10px] leading-5 text-slate-600">
                        Prices in South African rand. Proposed launch
                        allowances are subject to final plan configuration.
                        Payment-provider fees are separate.
                    </p>
                </section>

                {/* Final CTA */}
                <section className="mt-20 rounded-3xl border border-white/8 bg-white/[0.025] px-6 py-10 text-center sm:mt-24 sm:px-10 sm:py-14">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        Move. Manage. Multiply.
                    </p>

                    <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Give your business a clearer way to operate.
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
                        Explore PulseHive, find the right plan for your
                        operation, or speak to us about what your business
                        needs.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/contact"
                            className="rounded-xl bg-indigo-500 px-6 py-3 text-xs font-bold text-white transition hover:bg-indigo-400"
                        >
                            Talk to PulseHive
                        </Link>

                        <Link
                            href="/about"
                            className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"
                        >
                            About the platform
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}