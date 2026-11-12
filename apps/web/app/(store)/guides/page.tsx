'use client';

import { BookOpen } from 'lucide-react';

const GUIDES = [
    {
        title: 'Collagen Night Cream',
        image: '/products/nightcream.png',
        steps: [
            'Cleanse: Wash your face thoroughly and gently pat dry.',
            'Apply: Smooth a small amount of cream onto the affected areas.',
            'Routine: Safe for daily use on the face AT NIGHT time.',
        ],
    },
    {
        title: 'Collagen Day Cream',
        image: '/products/daycream.png',
        steps: [
            'Cleanse: Wash your face thoroughly and gently pat dry.',
            'Apply: Smooth a small amount of cream evenly onto the face and neck using upward strokes.',
            'Routine: Safe for daily morning use; apply before your sunscreen.',
        ],
    },
    {
        title: 'Collagen Serum',
        image: '/products/serum.png',
        steps: [
            'Prep: Cleanse your face (ideally with our Collagen Bar Soap) and pat dry.',
            'Apply: Apply 2–3 drops of serum to your face and neck TWICE a day; morning and night, for best results.',
            'Absorb: Gently pat and press into the skin until fully absorbed.',
            'Follow Up: Follow with your favorite moisturizer or Collagen Cream.',
        ],
    },
    {
        title: 'Collagen Bar Soap',
        image: '/products/soap.png',
        steps: [
            'Wet hands and bar soap to create a rich lather.',
            'Gently massage the lather onto your face using circular motions.',
            'Rinse thoroughly with warm water and pat dry.',
            'Frequency: Use TWICE daily, morning and night, for best results.',
        ],
    },
    {
        title: 'Collagen Capsules',
        image: '/products/capsules.png',
        steps: [
            'Take 1 collagen capsule after breakfast to fuel your skin from within for the day ahead.',
        ],
    },
    {
        title: 'Melasma Oil',
        image: '/products/melasma.png',
        steps: [
            'Cleanse: Wash your face thoroughly and gently pat dry.',
            'Apply: Dispense a few drops of oil onto your fingertips and gently massage into areas with hyperpigmentation or uneven skin tone.',
            'Routine: Safe for daily evening use; allow the oil to fully absorb before applying your night cream or moisturizer.',
        ],
    },
    {
        title: 'Body Hydrating Lotion',
        image: '/products/bodylotion.png',
        steps: [
            'Apply: Massage generously all over clean skin until absorbed. Use daily, ideally after showering.',
        ],
    },
    {
        title: 'Inner Dark Thighs Gel',
        image: '/products/innerthighs.png',
        steps: [
            'Apply: Massage a small amount onto clean, dry inner thighs until absorbed. Use morning and evening.',
        ],
    },
    {
        title: 'Slimming Tea',
        image: '/products/slimmingtea.png',
        steps: [
            'Steep: Steep 1 tea bag in hot water for 5–10 minutes before drinking.',
            'Routine: Consume as directed as part of your daily wellness routine.',
        ],
    },
    {
        title: 'Hips and Bum Gain Tablets',
        image: '/products/hipsbumgain.png',
        steps: [
            'Take: Swallow the recommended dosage with a full glass of water daily.',
        ],
    },
    {
        title: 'Body Gain Powder',
        image: '/products/bodypowder.png',
        steps: [
            'Mix: Stir or shake the recommended scoop into water, milk, or your favorite beverage until dissolved. Use daily.',
        ],
    },
    {
        title: 'Body Gain Tablets',
        image: '/products/bodygain.png',
        steps: [
            'Take: Swallow the recommended dosage with a full glass of water daily.',
        ],
    },
    {
        title: 'Skin Brightening Glow Body Gel',
        image: '/products/bodyglowgel.png',
        steps: [
            'Apply: Massage a generous amount onto clean, dry skin using circular motions until fully absorbed.',
            'Routine: Use daily, morning and evening, for a radiant glow.',
        ],
    },
];

export default function GuidesPage() {
    return (
        <div className="min-h-screen w-full bg-(--color-background) pb-12">
            <main className="mx-auto w-full max-w-[1440px] px-5 pt-6 sm:px-6 sm:pt-8">

                {/* Page header */}
                <div className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-8 sm:px-10 sm:py-9">
                    <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                    <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />
                    <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

                    <div className="relative z-10">
                        <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                            Skincare Routines
                        </span>

                        <h1 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl">
                            Product Guides
                        </h1>

                        <p className="mt-3 max-w-xl font-body text-xs leading-6 text-white/60 sm:text-sm">
                            Master your routine with our simple application steps.
                        </p>
                    </div>
                </div>

                {/* Four-column product guides */}
                <div className="grid grid-cols-2 items-stretch gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {GUIDES.map((guide, index) => (
                        <div
                            key={index}
                            className="flex flex-col overflow-hidden border border-(--color-border-strong) bg-(--color-surface) shadow-xs"
                        >
                            {/* Product image */}
                            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden border-b border-(--color-border) bg-(--color-background-soft)">
                                <img
                                    src={guide.image}
                                    alt={guide.title}
                                    className="h-[72%] w-[72%] object-contain p-2 transition-transform duration-300 hover:scale-105 sm:h-[76%] sm:w-[76%]"
                                />
                            </div>

                            {/* Guide content */}
                            <div className="flex flex-1 flex-col p-3 sm:p-5">
                                <h2 className="mb-4 border-b border-(--color-border) pb-3 font-body text-[11px] font-bold uppercase tracking-wider text-(--color-text) sm:text-sm">
                                    {guide.title}
                                </h2>

                                <ol className="space-y-3">
                                    {guide.steps.map((step, stepIndex) => {
                                        const [label, ...description] = step.split(': ');
                                        const hasLabel = description.length > 0;

                                        return (
                                            <li
                                                key={stepIndex}
                                                className="flex gap-2.5 font-body text-[10px] leading-relaxed text-(--color-text-muted) sm:text-xs"
                                            >
                                                <span className="shrink-0 font-bold text-(--color-gold-dark)">
                                                    {stepIndex + 1}.
                                                </span>

                                                <span className="text-(--color-text)">
                                                    {hasLabel ? (
                                                        <>
                                                            <strong className="font-bold">
                                                                {label}:
                                                            </strong>{' '}
                                                            {description.join(': ')}
                                                        </>
                                                    ) : (
                                                        step
                                                    )}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
