'use client';

import { BookOpen, ArrowRight } from 'lucide-react';

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
        <div className="w-full min-h-screen bg-(--color-background) pb-12">
            <main className="flex flex-col gap-6 px-6 pt-6">

                {/* Page Title */}
                <div className="flex flex-col gap-1 items-center text-center">
                    <div className="w-12 h-12 bg-(--color-surface) flex items-center justify-center text-(--color-gold-dark) mb-2 rounded-full border border-(--color-border)">
                        <BookOpen size={20} />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                        Skincare Routines
                    </span>

                    <h1 className="text-2xl font-serif text-(--color-text)">
                        Product Guides
                    </h1>

                    <p className="text-xs text-(--color-text-muted)">
                        Master your routine with our simple application steps.
                    </p>
                </div>

                {/* Guides Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">

                    {GUIDES.map((guide, index) => (
                        <div
                            key={index}
                            className="flex flex-col border border-(--color-border-strong) bg-(--color-surface) shadow-xs overflow-hidden"
                        >

                            {/* Product Image */}
                            <div className="relative w-full aspect-square bg-(--color-background-soft) flex items-center justify-center overflow-hidden border-b border-(--color-border)">
                                <img
                                    src={guide.image}
                                    alt={guide.title}
                                    className="w-70 object-contain p-4 sm:p-6 transition-transform duration-300 hover:scale-105"
                                />
                            </div>

                            {/* Guide Content */}
                            <div className="flex flex-col flex-1 p-4 sm:p-5">

                                <h2 className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-(--color-text) pb-3 mb-4 border-b border-(--color-border)">
                                    {guide.title}
                                </h2>

                                <ol className="space-y-3">
                                    {guide.steps.map((step, stepIndex) => {
                                        const [label, ...description] = step.split(': ');
                                        const hasLabel = description.length > 0;

                                        return (
                                            <li
                                                key={stepIndex}
                                                className="flex gap-2.5 text-[10px] sm:text-xs text-(--color-text-muted) leading-relaxed"
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

                {/* Support Box */}
                <div className="border border-(--color-border-strong) p-6 shadow-xs text-center">

                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-(--color-text) mb-1">
                        Need more help?
                    </h3>

                    <p className="text-xs text-(--color-text-muted) mb-4">
                        Message us on WhatsApp for personalised advice.
                    </p>

                    <div className="h-16" />

                    <a
                        href="https://wa.me/27681037459"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-12 inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3d2c10]/15 transition-all hover:brightness-105"
                    >
                        Chat to us
                        <ArrowRight size={14} />
                    </a>

                </div>

            </main>
        </div>
    );
}
