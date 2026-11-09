'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    PhoneCall,
    Mail,
    MapPin,
    Send,
    CheckCircle2,
    Loader2,
    ShoppingCart,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';

export default function ContactPage() {
    const { cart } = useCart();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setName('');
            setEmail('');
            setMessage('');
        }, 1000);
    };

    return (
        <div className="w-full min-h-screen bg-(--color-background) pb-12 box-border">
            <main className="flex flex-col gap-6 px-6 pt-6 max-w-full mx-auto w-full box-border">

                {/* =====================================================
                    PAGE HEADER
                    ===================================================== */}

                <div className="flex flex-col gap-1 items-center text-center">
                    <div className="w-12 h-12 bg-(--color-surface) flex items-center justify-center text-(--color-gold-dark) mb-2 rounded-full border border-(--color-border)">
                        <PhoneCall size={20} />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                        Get in Touch
                    </span>

                    <h1 className="text-2xl font-serif text-(--color-text)">
                        Contact Concierge
                    </h1>

                    <p className="text-xs text-(--color-text-muted)">
                        We are here to answer your questions and assist with your luxury routine.
                    </p>
                </div>

                {/* =====================================================
                    CONTACT FORM - FULL WIDTH
                    ===================================================== */}

                <div className="w-full border border-(--color-border-strong) p-6 shadow-xs box-border">

                    {submitted ? (
                        <div className="w-full py-12 flex flex-col items-center justify-center text-center">

                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 mb-3">
                                <CheckCircle2 size={24} />
                            </div>

                            <h3 className="text-base font-serif text-(--color-text)">
                                Message Received
                            </h3>

                            <p className="text-xs text-(--color-text-muted) max-w-sm text-center mt-2">
                                Thank you for reaching out. Our concierge team will get back to your inquiry shortly.
                            </p>

                            <button
                                type="button"
                                onClick={() => setSubmitted(false)}
                                className="mt-6 px-6 py-2.5 bg-(--color-surface) text-xs font-bold uppercase tracking-wider border border-(--color-border) text-(--color-gold-dark) transition hover:bg-(--color-background)"
                            >
                                Send Another Message
                            </button>

                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <h2 className="text-xs font-bold uppercase tracking-wider text-(--color-text) mb-2">
                                Send a Message
                            </h2>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-(--color-text)">
                                    Your Name *
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10]"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-(--color-text)">
                                    Email Address *
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10]"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-(--color-text)">
                                    Message *
                                </label>

                                <textarea
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10] resize-none"
                                    placeholder="How can we help you?"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 mt-2 inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#3d2c10]/10 transition hover:brightness-105 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Message
                                        <Send size={14} />
                                    </>
                                )}
                            </button>

                        </form>
                    )}
                </div>

                {/* =====================================================
                    DIRECT CHANNELS - FULL WIDTH BELOW FORM
                    ===================================================== */}

                <div className="w-full border border-(--color-border-strong) p-6 shadow-xs box-border">

                    <h2 className="text-xs font-bold uppercase tracking-wider text-(--color-text) mb-6 text-center">
                        Direct Channels
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                        {/* Email */}
                        <div className="flex flex-col items-center text-center gap-2">
                            <Mail
                                size={20}
                                className="text-(--color-gold-dark)"
                            />

                            <div>
                                <span className="text-[10px] uppercase font-bold text-(--color-text-muted) block mb-1">
                                    Email Us
                                </span>

                                <span className="text-xs text-(--color-text)">
                                    info@glowavee.store
                                </span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col items-center text-center gap-2">
                            <PhoneCall
                                size={20}
                                className="text-(--color-gold-dark)"
                            />

                            <div>
                                <span className="text-[10px] uppercase font-bold text-(--color-text-muted) block mb-1">
                                    Call Support
                                </span>

                                <span className="text-xs text-(--color-text)">
                                    +27 (0) 68 103 7459
                                </span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex flex-col items-center text-center gap-2">
                            <MapPin
                                size={20}
                                className="text-(--color-gold-dark)"
                            />

                            <div>
                                <span className="text-[10px] uppercase font-bold text-(--color-text-muted) block mb-1">
                                    Studio Location
                                </span>

                                <span className="text-xs text-(--color-text)">
                                    19 11th Ave, Northmead, Benoni, South Africa
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}