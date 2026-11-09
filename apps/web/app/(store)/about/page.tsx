'use client';

import Link from 'next/link';
import {
    Sparkles,
    ArrowRight,
    ShieldCheck,
    Heart,
    ShoppingBag,
    Gem,
    Star,
} from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="w-full min-h-screen bg-(--color-background) pb-12 box-border">
            {/* =====================================================
                MAIN CONTENT
                ===================================================== */}
            <main className="flex flex-col items-center gap-6 px-6 pt-6 max-w-full mx-auto w-full box-border">

                {/* =================================================
                    PAGE INTRO
                    ================================================= */}
                <div className="w-full flex flex-col items-center justify-center gap-1 text-center">

                    <div className="w-12 h-12 bg-(--color-surface) flex items-center justify-center text-(--color-gold-dark) mb-2 rounded-full border border-(--color-border)">
                        <Sparkles size={20} />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                        Our Story
                    </span>

                    <h1 className="text-2xl font-serif text-(--color-text)">
                        About Glowa Vee
                    </h1>

                    <p className="w-full max-w-sm mx-auto text-xs text-(--color-text-muted) text-center">
                        Beauty, confidence, and self-care — created for your everyday glow.
                    </p>

                </div>

                {/* =================================================
                    BRAND STORY
                    ================================================= */}
                <section className="w-full border border-(--color-border-strong) p-6 shadow-xs box-border">

                    <div className="w-full flex flex-col items-center justify-center text-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-(--color-background) border border-(--color-border) flex items-center justify-center text-(--color-gold-dark)">
                            <Star size={18} />
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                            Established 2026
                        </span>

                        <h2 className="text-xl font-serif text-(--color-text) text-center">
                            Beauty. Confidence. Your Glow.
                        </h2>

                        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center gap-4">

                            <p className="w-full text-xs text-(--color-text-muted) leading-relaxed text-center">
                                Glowa Vee Boutique is a South African beauty and
                                wellness brand established in 2026 with one simple
                                belief: everyone deserves to feel confident in
                                their own skin.
                            </p>

                            <p className="w-full text-xs text-(--color-text-muted) leading-relaxed text-center">
                                We bring together carefully selected beauty,
                                skincare, body care, and wellness products
                                designed to become part of your everyday
                                self-care routine.
                            </p>

                            <p className="w-full text-xs text-(--color-text-muted) leading-relaxed text-center">
                                Our journey began with a vision to create more
                                than just an online beauty store. Glowa Vee is
                                about the feeling that comes with taking time
                                for yourself — feeling refreshed, cared for,
                                and confident.
                            </p>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    OUR PHILOSOPHY
                    ================================================= */}
                <section className="w-full border border-(--color-border-strong) p-6 shadow-xs">

                    <div className="w-full flex flex-col items-center justify-center text-center">

                        <div className="flex flex-col items-center justify-center gap-2 mb-5">

                            <Heart
                                size={20}
                                className="text-(--color-gold-dark)"
                            />

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                                Our Philosophy
                            </span>

                            <h2 className="text-lg font-serif text-(--color-text) text-center">
                                Glow With Confidence
                            </h2>

                        </div>

                        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-4">

                            <p className="w-full text-xs text-(--color-text-muted) leading-relaxed text-center">
                                Your glow is more than what people see. It is how you
                                feel when you take care of yourself. It is the
                                confidence that comes from making yourself a priority
                                and creating routines that make you feel good.
                            </p>

                            <p className="w-full text-xs text-(--color-text-muted) leading-relaxed text-center">
                                That's why we focus on products that complement your
                                everyday beauty and wellness journey — helping you make
                                self-care a part of your lifestyle rather than an
                                afterthought.
                            </p>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    WHAT WE OFFER
                    ================================================= */}
                <section className="w-full border border-(--color-border-strong) p-6 shadow-xs">

                    <div className="w-full flex flex-col items-center justify-center text-center">

                        <div className="flex flex-col items-center justify-center gap-2 mb-6">

                            <ShoppingBag
                                size={20}
                                className="text-(--color-gold-dark)"
                            />

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                                Our Collection
                            </span>

                            <h2 className="text-lg font-serif text-(--color-text) text-center">
                                What We Offer
                            </h2>

                        </div>

                        <div className="w-full grid grid-cols-2 gap-4">

                            {/* Skincare */}
                            <div className="w-full p-4 border border-(--color-border) bg-(--color-background) flex flex-col items-center justify-center text-center gap-3">

                                <Sparkles
                                    size={18}
                                    className="text-(--color-gold-dark)"
                                />

                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-text) text-center">
                                    Skincare
                                </span>

                                <p className="w-full text-[10px] sm:text-[11px] text-(--color-text-muted) leading-relaxed text-center">
                                    Everyday products designed to complement
                                    your skincare routine.
                                </p>

                            </div>

                            {/* Body Care */}
                            <div className="w-full p-4 border border-(--color-border) bg-(--color-background) flex flex-col items-center justify-center text-center gap-3">

                                <Gem
                                    size={18}
                                    className="text-(--color-gold-dark)"
                                />

                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-text) text-center">
                                    Body Care
                                </span>

                                <p className="w-full text-[10px] sm:text-[11px] text-(--color-text-muted) leading-relaxed text-center">
                                    Products for nourishing, hydrating, and
                                    caring for your skin from head to toe.
                                </p>

                            </div>

                            {/* Beauty & Wellness */}
                            <div className="w-full p-4 border border-(--color-border) bg-(--color-background) flex flex-col items-center justify-center text-center gap-3">

                                <Star
                                    size={18}
                                    className="text-(--color-gold-dark)"
                                />

                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-text) text-center">
                                    Beauty & Wellness
                                </span>

                                <p className="w-full text-[10px] sm:text-[11px] text-(--color-text-muted) leading-relaxed text-center">
                                    Selected products to support your personal
                                    care and wellness routines.
                                </p>

                            </div>

                            {/* Self Care */}
                            <div className="w-full p-4 border border-(--color-border) bg-(--color-background) flex flex-col items-center justify-center text-center gap-3">

                                <Heart
                                    size={18}
                                    className="text-(--color-gold-dark)"
                                />

                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-text) text-center">
                                    Self-Care
                                </span>

                                <p className="w-full text-[10px] sm:text-[11px] text-(--color-text-muted) leading-relaxed text-center">
                                    Because taking care of yourself should be
                                    part of your lifestyle.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    OUR PROMISE
                    ================================================= */}
                <section className="w-full border border-(--color-border-strong) p-6 shadow-xs">

                    <div className="w-full flex flex-col items-center justify-center text-center">

                        <div className="flex flex-col items-center justify-center gap-2 mb-6">

                            <ShieldCheck
                                size={20}
                                className="text-(--color-gold-dark)"
                            />

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                                Our Promise
                            </span>

                            <h2 className="text-lg font-serif text-(--color-text) text-center">
                                You Come First
                            </h2>

                            <p className="w-full max-w-md mx-auto text-xs text-(--color-text-muted) leading-relaxed text-center">
                                We aim to make every Glowa Vee experience simple,
                                welcoming, and centred around you.
                            </p>

                        </div>

                        {/* Promise Cards */}
                        <div className="w-full max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 justify-items-center">

                            {[
                                'Offering carefully selected products.',
                                'Making beauty and wellness easier to explore.',
                                'Providing clear product and usage information.',
                                'Treating every customer with care and respect.',
                                'Continuing to grow alongside our community.',
                            ].map((promise, index) => (

                                <div
                                    key={index}
                                    className="w-full flex flex-col items-center justify-center gap-2 text-center p-4 border border-(--color-border) bg-(--color-background)"
                                >

                                    <div className="w-7 h-7 shrink-0 rounded-full bg-(--color-surface) border border-(--color-border) flex items-center justify-center">

                                        <span className="text-[9px] font-bold text-(--color-gold-dark)">
                                            {index + 1}
                                        </span>

                                    </div>

                                    <span className="w-full text-[10px] sm:text-[11px] text-(--color-text-muted) leading-relaxed text-center">
                                        {promise}
                                    </span>

                                </div>

                            ))}

                        </div>

                    </div>

                </section>

                {/* =================================================
                    OUR VISION
                    ================================================= */}
                <section className="w-full border border-(--color-border-strong) p-6 shadow-xs">

                    <div className="w-full flex flex-col items-center justify-center text-center">

                        <div className="flex flex-col items-center justify-center gap-2">

                            <Sparkles
                                size={20}
                                className="text-(--color-gold-dark)"
                            />

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                                Looking Ahead
                            </span>

                            <h2 className="text-lg font-serif text-(--color-text) text-center">
                                Our Vision
                            </h2>

                        </div>

                        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-4 mt-4">

                            <p className="w-full text-xs text-(--color-text-muted) leading-relaxed text-center">
                                We are just getting started.
                            </p>

                            <p className="w-full text-xs text-(--color-text-muted) leading-relaxed text-center">
                                Established in 2026, Glowa Vee is building a
                                brand that grows with its customers — continually
                                discovering new products, improving the shopping
                                experience, and creating a community around
                                beauty, confidence, and self-care.
                            </p>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    CTA
                    ================================================= */}
                <section className="w-full border border-(--color-border-strong) p-6 shadow-xs">

                    <div className="w-full flex flex-col items-center justify-center text-center">

                        <div className="w-full flex flex-col items-center justify-center gap-3 mb-5">

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark) text-center">
                                Your Journey Starts Here
                            </span>

                            <h2 className="text-xl font-serif text-(--color-text) text-center">
                                Find Your Glow
                            </h2>

                            <p className="w-full max-w-sm mx-auto text-xs text-(--color-text-muted) leading-relaxed text-center">
                                Whether you're building a new skincare routine,
                                exploring body care, or simply taking more time
                                for yourself, Glowa Vee is here to be part of
                                the journey.
                            </p>

                        </div>

                        <Link
                            href="/"
                            className="w-full h-12 inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#3d2c10]/10 transition hover:brightness-105"
                        >
                            Explore Collection
                            <ArrowRight size={16} />
                        </Link>

                    </div>

                </section>

            </main>
        </div>
    );
}
