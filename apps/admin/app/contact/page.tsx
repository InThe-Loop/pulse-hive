import type { Metadata } from 'next';
import Link from 'next/link';

import PublicPageShell from '@/components/marketing/PublicPageShell';
import ContactEnquiryForm from './components/ContactEnquiryForm';

export const metadata: Metadata = {
    title: 'Contact PulseHive',
    description:
        'Contact PulseHive about pricing, product demonstrations, onboarding or general enquiries.',
};

const enquiryTypes = [
    {
        title: 'Product and demonstrations',
        description:
            'Ask about the workflows available in PulseHive or discuss a product walkthrough.',
    },
    {
        title: 'Pricing and onboarding',
        description:
            'Tell us about your business, team and workspace requirements so we can discuss a suitable setup.',
    },
    {
        title: 'Partnerships and other enquiries',
        description:
            'Get in touch to discuss a potential collaboration or another question about PulseHive.',
    },
];

export default function ContactPage() {
    return (
        <PublicPageShell
            eyebrow="Contact PulseHive"
            title="Let's talk about what your business needs."
            description="Whether you're exploring the platform, comparing plans or looking at how to organise your order operations, send us an enquiry and tell us what you're working towards."
        >
            <section className="grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-5">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                            How can we help?
                        </p>
                        <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                            Start with a conversation.
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                            Share a little context about your business and the
                            challenges you're trying to solve. That helps us
                            make the conversation useful from the start.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {enquiryTypes.map((item, index) => (
                            <article
                                key={item.title}
                                className="rounded-xl border border-white/8 bg-white/[0.025] p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-400/[0.07] font-mono text-[10px] font-bold text-indigo-300">
                                        0{index + 1}
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">
                                            {item.title}
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="rounded-xl border border-white/8 bg-slate-900/50 p-5">
                        <p className="text-xs font-bold text-white">
                            Already have a PulseHive workspace?
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            Sign in to access your business workspace and its
                            operational tools.
                        </p>
                        <Link
                            href="/auth/login"
                            className="mt-4 inline-flex text-xs font-bold text-indigo-300 transition hover:text-indigo-200"
                        >
                            Go to workspace sign in →
                        </Link>
                    </div>
                </div>

                <ContactEnquiryForm />
            </section>
        </PublicPageShell>
    );
}
