'use client';

import Link from 'next/link';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

const helpSections = [
    {
        eyebrow: 'ORDERS',
        title: 'Customer Orders',
        description:
            'Understand order records, customer information, payment status and order fulfilment.',
        links: [
            { label: 'Open Customer Orders', href: '/orders' },
        ],
        articles: [
            {
                question: 'Where can I find a customer order?',
                answer:
                    'Open Customer Orders to search and filter orders by reference, customer, payment status and fulfilment stage. Select an order to inspect its details.',
            },
            {
                question: 'Can I update an order after it has been received?',
                answer:
                    'Order fulfilment can be progressed through its permitted stages. Payment state is managed through the payment gateway integration and should not be manually changed from the Orders page.',
            },
        ],
    },
    {
        eyebrow: 'PAYMENTS',
        title: 'Money In & Payment Matcher',
        description:
            'Understand gateway transaction records and how they relate to customer orders.',
        links: [
            { label: 'Open Payment Matcher', href: '/reconciliation' },
            { label: 'Open Customer Orders', href: '/orders' },
        ],
        articles: [
            {
                question: 'What does a completed payment mean?',
                answer:
                    'A completed payment means the gateway has reported the transaction as completed. It is a gateway transaction status, not independent confirmation that funds have settled in your bank account.',
            },
            {
                question: 'What does Payment Matcher do?',
                answer:
                    'Payment Matcher compares completed gateway payment records against order values and highlights potential matches, partial payments and exceptions.',
            },
            {
                question: 'Does Payment Matcher reconcile my bank statement?',
                answer:
                    'No. The current feature works with gateway payment records and customer orders. It does not import bank statements or verify bank settlement.',
            },
        ],
    },
    {
        eyebrow: 'WORKSPACE',
        title: 'Team & Access',
        description:
            'Understand workspace membership and the permissions assigned to team members.',
        links: [
            { label: 'Manage Team & Access', href: '/team' },
        ],
        articles: [
            {
                question: 'Why can\'t I access a particular page?',
                answer:
                    'Workspace access is permission-based. Your role may not include the permission required for that feature. Ask your workspace owner or administrator to review your access.',
            },
            {
                question: 'How do I invite another team member?',
                answer:
                    'Open Team & Access and use the invitation workflow, provided your workspace role has permission to manage team access.',
            },
        ],
    },
    {
        eyebrow: 'ACCOUNT',
        title: 'Profile & Workspace',
        description:
            'Find your account settings and understand how workspace selection works.',
        links: [
            { label: 'My Profile', href: '/profile' },
            { label: 'Billing & Subscription', href: '/billing' },
        ],
        articles: [
            {
                question: 'What happens when I belong to multiple workspaces?',
                answer:
                    'You can choose the business workspace you want to manage. Workspace data and permissions are scoped to the selected workspace.',
            },
            {
                question: 'Where can I manage my subscription?',
                answer:
                    'The Billing & Subscription page explains the current billing process and provides a way to contact PulseHive about your package and billing arrangements.',
            },
        ],
    },
];

export default function SupportPage() {
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
                            Account / Support
                        </p>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white">
                        Support & Documentation
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Find guidance on using PulseHive and managing your
                        business workspace.
                    </p>
                </div>

                <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-400"
                >
                    Contact PulseHive
                </Link>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {helpSections.map((section, index) => (
                    <article
                        key={section.title}
                        className="ph-glass-panel flex flex-col p-5"
                    >
                        <span className="font-mono text-[10px] font-bold tracking-widest text-indigo-300">
                            0{index + 1} / {section.eyebrow}
                        </span>

                        <h2 className="mt-3 text-sm font-bold text-white">
                            {section.title}
                        </h2>

                        <p className="mt-2 flex-1 text-xs leading-5 text-slate-400">
                            {section.description}
                        </p>

                        <div className="mt-5 flex flex-col items-start gap-2">
                            {section.links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-[11px] font-bold text-indigo-300 transition hover:text-indigo-200"
                                >
                                    {link.label} →
                                </Link>
                            ))}
                        </div>
                    </article>
                ))}
            </section>

            <section className="space-y-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                        Help centre
                    </p>

                    <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                        Frequently asked questions
                    </h2>

                    <p className="mt-2 text-xs text-slate-400">
                        Guidance for the workflows currently available in PulseHive.
                    </p>
                </div>

                <div className="space-y-4">
                    {helpSections.map((section) => (
                        <section
                            key={section.title}
                            className="ph-glass-panel overflow-hidden"
                        >
                            <div className="border-b border-white/6 px-5 py-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                                    {section.eyebrow}
                                </p>

                                <h3 className="mt-1 text-sm font-bold text-white">
                                    {section.title}
                                </h3>
                            </div>

                            <div className="divide-y divide-white/5">
                                {section.articles.map((article) => (
                                    <details
                                        key={article.question}
                                        className="group px-5 py-4"
                                    >
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs font-semibold text-slate-200 marker:hidden">
                                            <span>{article.question}</span>

                                            <span className="shrink-0 text-indigo-300 transition-transform group-open:rotate-45">
                                                +
                                            </span>
                                        </summary>

                                        <p className="max-w-4xl pt-3 text-xs leading-6 text-slate-400">
                                            {article.answer}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </section>

            <section className="flex flex-col justify-between gap-5 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.05] p-6 sm:flex-row sm:items-center sm:p-8">
                <div className="max-w-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                        Need a hand?
                    </p>

                    <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                        Let's get your question sorted.
                    </h2>

                    <p className="mt-2 text-xs leading-6 text-slate-400">
                        Send us a description of the issue, the workspace
                        involved and any relevant order references. Our
                        Contact page provides the enquiry workflow.
                    </p>
                </div>

                <Link
                    href="/contact"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-400"
                >
                    Get in touch →
                </Link>
            </section>

            <p className="text-center text-[10px] text-slate-600">
                PulseHive Support · Move. Manage. Multiply.
            </p>
        </div>
    );
}