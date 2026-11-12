'use client';

import {
    Flower2,
    ShieldCheck,
    Heart,
    ShoppingBag,
    Gem,
    Star,
    Droplets,
    ArrowUpRight,
} from 'lucide-react';

const promises = [
    'Offering carefully selected products.',
    'Making beauty and wellness easier to explore.',
    'Providing clear product and usage information.',
    'Treating every customer with care and respect.',
    'Continuing to grow alongside our community.',
];

const collections = [
    {
        icon: Droplets,
        title: 'Skincare',
        description:
            'Everyday products designed to complement your skincare routine.',
    },
    {
        icon: Gem,
        title: 'Body Care',
        description:
            'Products for nourishing, hydrating, and caring for your skin from head to toe.',
    },
    {
        icon: Star,
        title: 'Beauty & Wellness',
        description:
            'Selected products to support your personal care and wellness routines.',
    },
    {
        icon: Heart,
        title: 'Self-Care',
        description:
            'Because taking care of yourself should be part of your lifestyle.',
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen w-full bg-(--color-background) pb-16">
            <main className="mx-auto flex w-full max-w-360 flex-col gap-6 px-5 pt-6 sm:px-6 sm:pt-8">

                {/* HERO */}
                <section className="relative mb-0 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-8 sm:px-10 sm:py-9">
                    <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                    <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />
                    <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                                Our Story
                            </span>

                            <h1 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl">
                                About Glowa Vee
                            </h1>

                            <p className="mt-3 max-w-xl font-body text-xs leading-6 text-white/60 sm:text-sm">
                                Beauty, confidence, and self-care — created for your everyday glow.
                            </p>
                        </div>

                        <div className="hidden shrink-0 pb-1 text-right lg:block">
                            <span className="block font-body text-[9px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                                Established
                            </span>
                            <span className="mt-1 block font-serif text-2xl text-white/80">
                                2026
                            </span>
                            <div className="ml-auto mt-3 h-px w-16 gold-foil" />
                        </div>
                    </div>
                </section>

                {/* BRAND STORY */}
                <section className="grid border border-(--color-border-strong) bg-(--color-surface) lg:grid-cols-[0.8fr_1.5fr]">
                    <div className="flex flex-col justify-between border-b border-(--color-border) p-6 sm:p-9 lg:border-b-0 lg:border-r lg:p-12">
                        <div>
                            <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                                Established 2026
                            </span>

                            <h2 className="mt-4 max-w-sm font-serif text-2xl leading-snug text-(--color-text) sm:text-3xl">
                                Beauty.
                                <br />
                                Confidence.
                                <br />
                                Your Glow.
                            </h2>
                        </div>

                        <div className="mt-10 flex items-center gap-3">
                            <div className="h-px w-10 gold-foil" />
                            <span className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-(--color-text-muted)">
                                The Glowa Vee Story
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center gap-5 p-6 sm:p-9 lg:p-12">
                        <p className="font-body text-sm leading-7 text-(--color-text) sm:text-base sm:leading-8">
                            Glowa Vee is a South African beauty and wellness
                            brand established in 2026 with one simple belief:
                            everyone deserves to feel confident in their own
                            skin.
                        </p>

                        <p className="font-body text-xs leading-7 text-(--color-text-muted) sm:text-sm sm:leading-8">
                            We bring together carefully selected beauty,
                            skincare, body care, and wellness products
                            designed to become part of your everyday
                            self-care routine.
                        </p>

                        <p className="font-body text-xs leading-7 text-(--color-text-muted) sm:text-sm sm:leading-8">
                            Our journey began with a vision to create more
                            than just an online beauty store. Glowa Vee is
                            about the feeling that comes with taking time
                            for yourself — feeling refreshed, cared for,
                            and confident.
                        </p>
                    </div>
                </section>

                {/* PHILOSOPHY */}
                <section className="relative overflow-hidden border border-(--color-border-strong) bg-[linear-gradient(135deg,#1c1913_0%,#11100e_65%,#0b0b0a_100%)] px-6 py-10 text-center sm:px-10 sm:py-14">
                    <div className="absolute inset-x-0 top-0 h-px gold-foil" />
                    <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-(--color-gold)/10" />

                    <div className="relative mx-auto flex max-w-2xl flex-col items-center">
                        <Heart
                            size={23}
                            strokeWidth={1.4}
                            className="text-(--color-gold-light)"
                        />

                        <span className="mt-4 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                            Our Philosophy
                        </span>

                        <h2 className="mt-3 font-serif text-2xl text-white sm:text-3xl">
                            Glow With Confidence
                        </h2>

                        <div className="my-6 h-px w-12 gold-foil" />

                        <p className="font-body text-xs leading-7 text-white/65 sm:text-sm sm:leading-8">
                            Your glow is more than what people see. It is
                            how you feel when you take care of yourself.
                            It is the confidence that comes from making
                            yourself a priority and creating routines
                            that make you feel good.
                        </p>

                        <p className="mt-4 font-body text-xs leading-7 text-white/65 sm:text-sm sm:leading-8">
                            That's why we focus on products that complement
                            your everyday beauty and wellness journey —
                            helping you make self-care a part of your
                            lifestyle rather than an afterthought.
                        </p>
                    </div>
                </section>

                {/* COLLECTION */}
                <section className="border border-(--color-border-strong) bg-(--color-surface) p-6 sm:p-9 lg:p-12">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <ShoppingBag
                            size={22}
                            strokeWidth={1.4}
                            className="text-(--color-gold-dark)"
                        />

                        <span className="mt-4 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                            Our Collection
                        </span>

                        <h2 className="mt-2 font-serif text-2xl text-(--color-text) sm:text-3xl">
                            What We Offer
                        </h2>

                        <p className="mt-3 max-w-md font-body text-xs leading-6 text-(--color-text-muted)">
                            Thoughtfully selected essentials for your
                            beauty, wellness and self-care rituals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {collections.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <article
                                    key={item.title}
                                    className="group flex flex-col items-center border border-(--color-border) bg-(--color-background) px-5 py-8 text-center transition-colors hover:border-(--color-gold)/50"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-gold-dark) transition-colors group-hover:border-(--color-gold)/40">
                                        <Icon size={20} strokeWidth={1.4} />
                                    </div>

                                    <span className="mt-5 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-gold-dark)">
                                        0{index + 1}
                                    </span>

                                    <h3 className="mt-2 font-serif text-lg text-(--color-text)">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 font-body text-[11px] leading-6 text-(--color-text-muted)">
                                        {item.description}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* OUR PROMISE */}
                <section className="grid border border-(--color-border-strong) bg-(--color-surface) lg:grid-cols-[0.8fr_1.5fr]">
                    <div className="flex flex-col justify-center border-b border-(--color-border) p-6 sm:p-9 lg:border-b-0 lg:border-r lg:p-12">
                        <ShieldCheck
                            size={24}
                            strokeWidth={1.4}
                            className="text-(--color-gold-dark)"
                        />

                        <span className="mt-5 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                            Our Promise
                        </span>

                        <h2 className="mt-3 font-serif text-2xl leading-snug text-(--color-text) sm:text-3xl">
                            You Come First
                        </h2>

                        <p className="mt-4 max-w-sm font-body text-xs leading-7 text-(--color-text-muted) sm:text-sm">
                            We aim to make every Glowa Vee experience
                            simple, welcoming, and centred around you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 sm:p-9 lg:p-12">
                        {promises.map((promise, index) => (
                            <div
                                key={promise}
                                className="flex items-start gap-4 border border-(--color-border) bg-(--color-background) p-4"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) font-body text-[10px] font-bold text-(--color-gold-dark)">
                                    0{index + 1}
                                </span>

                                <p className="pt-1 font-body text-xs leading-6 text-(--color-text-muted)">
                                    {promise}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* OUR VISION */}
                <section className="relative overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.12),transparent_50%),linear-gradient(135deg,#1c1913_0%,#11100e_65%,#0b0b0a_100%)] px-6 py-10 sm:px-10 sm:py-14">
                    <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                    <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
                        <Flower2
                            size={23}
                            strokeWidth={1.4}
                            className="text-(--color-gold-light)"
                        />

                        <span className="mt-4 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                            Looking Ahead
                        </span>

                        <h2 className="mt-3 font-serif text-2xl text-white sm:text-3xl">
                            Our Vision
                        </h2>

                        <p className="mt-5 font-body text-xs leading-7 text-white/65 sm:text-sm sm:leading-8">
                            We are just getting started.
                        </p>

                        <p className="mt-2 font-body text-xs leading-7 text-white/65 sm:text-sm sm:leading-8">
                            Established in 2026, Glowa Vee is building a
                            brand that grows with its customers — continually
                            discovering new products, improving the shopping
                            experience, and creating a community around
                            beauty, confidence, and self-care.
                        </p>

                        <div className="mt-8 flex items-center gap-3 font-body text-[9px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                            <span className="h-px w-8 gold-foil" />
                            Your glow. Your way.
                            <span className="h-px w-8 gold-foil" />
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
