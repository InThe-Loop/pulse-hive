'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

type Feedback = {
    type: 'success' | 'error';
    message: string;
} | null;

const CONTACT_EMAIL =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || '';

export default function ContactEnquiryForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [topic, setTopic] = useState('General enquiry');
    const [message, setMessage] = useState('');
    const [feedback, setFeedback] = useState<Feedback>(null);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFeedback(null);

        if (!CONTACT_EMAIL) {
            setFeedback({
                type: 'error',
                message:
                    'Enquiry delivery is not configured yet. Set NEXT_PUBLIC_CONTACT_EMAIL in the admin app environment to enable the form.',
            });
            return;
        }

        const subject = `[PulseHive] ${topic}`;

        const body = [
            `Name: ${name.trim()}`,
            `Reply email: ${email.trim()}`,
            `Enquiry type: ${topic}`,
            '',
            message.trim(),
        ].join('\n');

        const mailto = `mailto:${CONTACT_EMAIL}?${new URLSearchParams({
            subject,
            body,
        }).toString()}`;

        window.location.href = mailto;

        setFeedback({
            type: 'success',
            message:
                'Your email application should open with the enquiry ready. Review it and send the message from there.',
        });
    }

    const feedbackClasses =
        feedback?.type === 'success'
            ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200'
            : 'border-amber-400/20 bg-amber-400/[0.06] text-amber-200';

    return (
        <form
            onSubmit={handleSubmit}
            className="ph-glass-panel space-y-5 p-6 sm:p-8"
        >
            <div>
                <h2 className="text-xl font-black tracking-tight text-white">
                    Send an enquiry
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                    Complete the form and your default email application will
                    open with the message prepared for you.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="contact-name"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                    >
                        Your name
                    </label>

                    <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={100}
                        required
                        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50"
                        placeholder="Name and surname"
                    />
                </div>

                <div>
                    <label
                        htmlFor="contact-email"
                        className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                    >
                        Email address
                    </label>

                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        maxLength={254}
                        required
                        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50"
                        placeholder="you@company.com"
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="contact-topic"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                >
                    What would you like to discuss?
                </label>

                <select
                    id="contact-topic"
                    name="topic"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-slate-200 outline-none transition focus:border-indigo-400/50"
                >
                    <option>General enquiry</option>
                    <option>Pricing and plans</option>
                    <option>Product demonstration</option>
                    <option>Onboarding</option>
                    <option>Partnership</option>
                    <option>Technical support</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor="contact-message"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500"
                >
                    Message
                </label>

                <textarea
                    id="contact-message"
                    name="message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    minLength={10}
                    maxLength={4000}
                    rows={6}
                    required
                    className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50"
                    placeholder="Tell us a little about your business and what you need..."
                />
            </div>

            {feedback && (
                <p
                    role="status"
                    className={`rounded-lg border px-3 py-3 text-xs leading-5 ${feedbackClasses}`}
                >
                    {feedback.message}
                </p>
            )}

            {!CONTACT_EMAIL && (
                <p className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-3 text-[11px] leading-5 text-slate-500">
                    The form is ready, but email delivery needs a recipient.
                    Configure{' '}
                    <code className="text-slate-300">
                        NEXT_PUBLIC_CONTACT_EMAIL
                    </code>{' '}
                    to activate enquiry hand-off.
                </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-white/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] leading-5 text-slate-600">
                    This opens your email application; it does not send a
                    message automatically.
                </p>

                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-400"
                >
                    Prepare enquiry
                </button>
            </div>
        </form>
    );
}