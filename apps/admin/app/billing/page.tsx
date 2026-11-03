'use client';

import Link from 'next/link';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

const planOptions = [
    {
        name: 'Essentials',
        description: 'A practical starting point for managing daily order operations.',
        features: [
            'Business workspace',
            'Product and order visibility',
            'Gateway payment status records',
            'Core order management',
        ],
    },
    {
        name: 'Operations',
        description: 'More operational oversight for teams coordinating orders and delivery.',
        features: [
            'Everything in Essentials',
            'Team memberships and role-based access',
            'Fulfilment stages and tracking',
            'Operational dashboard and activity visibility',
        ],
        featured: true,
    },
    {
        name: 'Multi-workspace',
        description: 'For businesses managing more than one business workspace.',
        features: [
            'Multiple business workspaces',
            'Workspace-specific access controls',
            'Consolidated workspace switching',
            'Additional workflow scoping',
        ],
    },
];

function BillingInfoCard({
    title,
    description,
    status,
}: {
    title: string;
    description: string;
    status: string;
}) {
    return (
        <div className="ph-glass-panel p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {title}
            </p>

            <p className="mt-3 text-sm font-bold text-white">
                {status}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
                {description}
            </p>
        </div>
    );
}

export default function BillingPage() {
    const { isAuthenticated, isChecking } = useAuthGuard();

    if (isChecking || !isAuthenticated) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-sm text-slate-400">
                    Checking your workspace session...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col justify-between gap-5 border-b border-white/6 pb-6 xl:flex-row xl:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                            Account / Billing
                        </p>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white">
                        Billing & Subscription
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Review your subscription arrangements and billing information.
                    </p>
                </div>

                <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-400"
                >
                    Contact PulseHive
                </Link>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <BillingInfoCard
                    title="Subscription"
                    status="Managed with PulseHive"
                    description="Your subscription package and commercial terms are confirmed during setup."
                />

                <BillingInfoCard
                    title="Billing cycle"
                    status="Confirmed separately"
                    description="Your billing frequency and payment arrangements are agreed with PulseHive."
                />

                <BillingInfoCard
                    title="Invoice history"
                    status="Managed outside the workspace"
                    description="Invoice records are not currently stored or displayed in PulseHive."
                />
            </section>

            <section className="ph-glass-panel overflow-hidden">
                <div className="border-b border-white/6 p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                                Subscription management
                            </p>

                            <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                                Your billing arrangement
                            </h2>

                            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400">
                                PulseHive subscription details are currently
                                managed through our onboarding and billing
                                process. Contact us to confirm your package,
                                billing contact and payment arrangements.
                            </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1.5 text-[10px] font-bold text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Manual billing setup
                        </span>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Payment methods
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                                Managed separately
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                No subscription payment method can currently
                                be managed from this page.
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Subscription invoices
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                                Not available in the workspace yet
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                Any invoices issued through the current
                                billing arrangement are shared separately.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                    <div>
                        <h3 className="text-sm font-bold text-white">
                            Need to review your subscription?
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            Contact us about a plan change, billing query or invoice.
                        </p>
                    </div>

                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/[0.07] px-4 py-2.5 text-xs font-bold text-indigo-200 transition hover:bg-indigo-400/15"
                    >
                        Discuss billing →
                    </Link>
                </div>
            </section>

            <section className="space-y-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                        Available packages
                    </p>

                    <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                        Explore your plan options
                    </h2>

                    <p className="mt-2 text-xs leading-6 text-slate-400">
                        Packages are scoped around your workspace, team and
                        operational requirements. Contact PulseHive for a quote.
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {planOptions.map((plan) => (
                        <article
                            key={plan.name}
                            className={`flex flex-col rounded-2xl border p-5 ${
                                plan.featured
                                    ? 'border-indigo-400/30 bg-indigo-500/[0.06]'
                                    : 'border-white/8 bg-white/[0.02]'
                            }`}
                        >
                            {plan.featured && (
                                <span className="mb-3 self-start rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-indigo-200">
                                    Team focused
                                </span>
                            )}

                            <h3 className="text-lg font-black text-white">
                                {plan.name}
                            </h3>

                            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">
                                {plan.description}
                            </p>

                            <ul className="mt-5 flex-1 space-y-2.5">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2 text-xs text-slate-300"
                                    >
                                        <span className="text-emerald-300">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/contact"
                                className="mt-6 inline-flex justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"
                            >
                                Discuss this package
                            </Link>
                        </article>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-indigo-400/15 bg-indigo-500/[0.04] p-5 sm:p-6">
                <h2 className="text-sm font-bold text-white">
                    A note about payment processing
                </h2>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                    Gateway transactions recorded in PulseHive relate to
                    payments made by your customers. They are separate from
                    your PulseHive subscription. Payment-provider processing
                    charges are also separate from any PulseHive subscription
                    fees. Please refer to your provider's terms for the
                    applicable transaction charges.
                </p>

                <Link
                    href="/pricing"
                    className="mt-4 inline-flex text-xs font-bold text-indigo-300 transition hover:text-indigo-200"
                >
                    View public pricing information →
                </Link>
            </section>
        </div>
    );
}