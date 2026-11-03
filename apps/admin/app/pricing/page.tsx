import type { Metadata } from 'next';
import Link from 'next/link';

import PublicPageShell from '@/components/marketing/PublicPageShell';

export const metadata: Metadata = {
    title: 'PulseHive Pricing | Plans for Growing Businesses',
    description:
        'Explore PulseHive monthly plans for commerce operations. Choose Essentials, Growth or Scale, with Enterprise options available.',
};

const plans = [
    {
        id: 'essentials',
        name: 'Essentials',
        price: 'R249',
        audience: 'For businesses getting started with organised online sales.',
        description:
            'Bring your basic sales and order activity into one business workspace.',
        workspace: '1 workspace',
        team: 'Up to 2 team members',
        orders: 'Up to 100 orders per month',
        features: [
            'Product and customer management',
            'Online storefront and checkout integration',
            'Customer order management',
            'Gateway payment status visibility',
            'Core business workspace',
        ],
        featured: false,
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 'R599',
        audience: 'For growing businesses coordinating orders, payments and delivery.',
        description:
            'More operational visibility for businesses with regular order activity.',
        workspace: '1 workspace',
        team: 'Up to 5 team members',
        orders: 'Up to 500 orders per month',
        features: [
            'Everything in Essentials',
            'Fulfilment stages and delivery tracking',
            'Payment-to-order reconciliation visibility',
            'Operational dashboard and activity',
            'CSV exports',
        ],
        featured: true,
    },
    {
        id: 'scale',
        name: 'Scale',
        price: 'R1,199',
        audience: 'For established businesses with larger teams and order volumes.',
        description:
            'More room for growing teams and higher operational activity.',
        workspace: '1 workspace',
        team: 'Up to 15 team members',
        orders: 'Up to 2,000 orders per month',
        features: [
            'Everything in Growth',
            'Advanced team permission options',
            'Higher operational usage allowance',
            'Assisted onboarding',
            'Priority support',
        ],
        featured: false,
    },
];

const enterpriseFeatures = [
    'Custom workspace and order allowances',
    'Multiple business workspaces',
    'Custom integration requirements',
    'Tailored onboarding and support arrangements',
];

const faqs = [
    {
        question: 'Is there an additional PulseHive commission on sales?',
        answer:
            'No. PulseHive does not add a percentage commission to your sales. Your connected payment provider may still charge its own payment-processing fees.',
    },
    {
        question: 'Are payment-provider fees included?',
        answer:
            'No. Gateway processing fees are charged by the payment provider you use, such as Ozow or another supported provider. Those charges are separate from your PulseHive subscription.',
    },
    {
        question: 'Can I change my plan as my business grows?',
        answer:
            'The plan structure is designed to support businesses as their teams and order volumes grow. Contact us to discuss the appropriate plan and transition.',
    },
    {
        question: 'Can I have more than one business workspace?',
        answer:
            'Multi-workspace requirements can be discussed under Enterprise, including how teams and access should be organised across businesses.',
    },
];

export default function PricingPage() {
    return (
        <PublicPageShell
            eyebrow="Straightforward monthly pricing"
            title="The right tools for every stage of your business."
            description="Choose a PulseHive plan that fits your current operation. Start with the essentials, bring more of your workflow together as you grow, and keep your subscription separate from payment-provider processing fees."
        >
            {/* Pricing principles */}
            <section className="grid gap-4 sm:grid-cols-3">
                <div className="ph-glass-panel p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                        Predictable
                    </p>
                    <h2 className="mt-3 text-lg font-bold text-white">
                        A monthly subscription
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                        Know your platform subscription cost each month.
                    </p>
                </div>

                <div className="ph-glass-panel p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                        No platform commission
                    </p>
                    <h2 className="mt-3 text-lg font-bold text-white">
                        0% additional sales commission
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                        PulseHive does not take a percentage of your sales.
                    </p>
                </div>

                <div className="ph-glass-panel p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300">
                        Separate provider fees
                    </p>
                    <h2 className="mt-3 text-lg font-bold text-white">
                        Keep payment costs clear
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                        Payment gateways charge their own processing fees.
                    </p>
                </div>
            </section>

            {/* Plan cards */}
            <section>
                <div className="mb-7 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        Monthly plans
                    </p>

                    <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                        Choose the plan that fits your operation.
                    </h2>

                    <p className="mt-3 text-sm text-slate-400">
                        All prices are per workspace, per month.
                    </p>
                </div>

                <div className="grid items-stretch gap-4 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <article
                            id={plan.id}
                            key={plan.id}
                            className={`scroll-mt-28 flex h-full flex-col rounded-2xl border p-6 sm:p-7 ${
                                plan.featured
                                    ? 'border-indigo-400/40 bg-indigo-500/[0.07] shadow-xl shadow-indigo-950/20'
                                    : 'border-white/8 bg-white/[0.025]'
                            }`}
                        >
                            {plan.featured ? (
                                <span className="mb-5 self-start rounded-full border border-indigo-400/25 bg-indigo-400/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-indigo-200">
                                    Recommended
                                </span>
                            ) : (
                                <span className="mb-5 h-6" />
                            )}

                            <h3 className="text-xl font-black tracking-tight text-white">
                                {plan.name}
                            </h3>

                            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">
                                {plan.audience}
                            </p>

                            <p className="mt-6">
                                <span className="font-mono text-4xl font-black tracking-tight text-white">
                                    {plan.price}
                                </span>
                                <span className="ml-2 text-xs text-slate-500">
                                    / month
                                </span>
                            </p>

                            <p className="mt-1 text-[10px] text-slate-600">
                                Per business workspace
                            </p>

                            <p className="mt-5 text-sm leading-6 text-slate-400">
                                {plan.description}
                            </p>

                            <div className="my-6 border-t border-white/8" />

                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Plan allowances
                            </p>

                            <div className="mt-3 space-y-2">
                                {[plan.workspace, plan.team, plan.orders].map(
                                    (allowance) => (
                                        <p
                                            key={allowance}
                                            className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2 text-xs font-semibold text-slate-300"
                                        >
                                            {allowance}
                                        </p>
                                    ),
                                )}
                            </div>

                            <div className="my-6 border-t border-white/8" />

                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                What's included
                            </p>

                            <ul className="mt-4 flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-3 text-xs leading-5 text-slate-300"
                                    >
                                        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[10px] font-bold text-emerald-300">
                                            ✓
                                        </span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={`/contact?plan=${plan.id}`}
                                className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs font-bold transition ${
                                    plan.featured
                                        ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                                        : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                                }`}
                            >
                                Enquire about {plan.name}
                            </Link>
                        </article>
                    ))}
                </div>

                <p className="mt-5 text-center text-[10px] leading-5 text-slate-600">
                    Prices are in South African rand (ZAR). The team and order
                    allowances shown are proposed launch package limits; they
                    are not yet automatically enforced by the application and
                    will be confirmed during onboarding. Applicable taxes will
                    be reflected in billing.
                </p>
            </section>

            {/* Enterprise */}
            <section className="relative isolate overflow-hidden rounded-3xl border border-indigo-400/20 bg-indigo-500/[0.06] p-6 sm:p-9">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"
                />

                <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                            Enterprise
                        </p>

                        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                            Built around your organisation.
                        </h2>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                            For businesses managing multiple brands,
                            workspaces or more complex operational
                            requirements. We will work with you to understand
                            the scope and put together an appropriate setup.
                        </p>

                        <p className="mt-6 text-2xl font-black text-white">
                            Custom pricing
                        </p>

                        <Link
                            href="/contact?plan=enterprise"
                            className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-400"
                        >
                            Discuss Enterprise
                        </Link>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {enterpriseFeatures.map((feature) => (
                            <div
                                key={feature}
                                className="rounded-xl border border-white/8 bg-slate-950/30 p-4"
                            >
                                <span className="text-xs leading-5 text-slate-300">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Payment fees explanation */}
            <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                        Understanding your costs
                    </p>

                    <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                        Your subscription and payment fees are separate.
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-slate-400">
                        PulseHive charges a monthly platform subscription.
                        Your payment provider processes the transaction and
                        applies its own fees according to your agreement with
                        that provider.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="ph-glass-panel p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                            PulseHive
                        </p>

                        <p className="mt-3 text-2xl font-black text-white">
                            Fixed monthly fee
                        </p>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            Based on the plan you choose. No additional
                            percentage commission on sales.
                        </p>
                    </div>

                    <div className="ph-glass-panel p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                            Payment provider
                        </p>

                        <p className="mt-3 text-2xl font-black text-white">
                            Provider fees
                        </p>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            Charged separately by your selected payment
                            provider for processing transactions.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section>
                <div className="mb-7 max-w-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        Frequently asked questions
                    </p>

                    <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                        A few things worth knowing.
                    </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    {faqs.map((faq) => (
                        <article
                            key={faq.question}
                            className="ph-glass-panel p-5 sm:p-6"
                        >
                            <h3 className="text-sm font-bold text-white">
                                {faq.question}
                            </h3>

                            <p className="mt-3 text-xs leading-6 text-slate-400">
                                {faq.answer}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="flex flex-col justify-between gap-6 rounded-2xl border border-white/8 bg-white/[0.025] p-6 sm:flex-row sm:items-center sm:p-8">
                <div className="max-w-2xl">
                    <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                        Not sure which plan is right for you?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Tell us about your business, your team and the way you
                        process orders. We can help you work out the most
                        suitable setup.
                    </p>
                </div>

                <Link
                    href="/contact"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-400"
                >
                    Talk to us
                </Link>
            </section>
        </PublicPageShell>
    );
}