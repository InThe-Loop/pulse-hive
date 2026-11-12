import Link from 'next/link';
import { GlowaVeeLogo } from '@/components/glowa-vee-logo';
import { ArrowLeft } from 'lucide-react';

interface AuthPageLayoutProps {
    eyebrow: string;
    title: string;
    description: string;
    tagline: string;
    formTitle: string;
    formDescription: string;
    formScrollable?: boolean;
    children: React.ReactNode;
}

export function AuthPageLayout({
    eyebrow,
    title,
    description,
    tagline,
    formTitle,
    formDescription,
    formScrollable = false,
    children,
}: AuthPageLayoutProps) {
    return (
        <main className="grid min-h-dvh w-full grid-cols-1 lg:h-dvh lg:min-h-0 lg:grid-cols-[55fr_45fr] lg:overflow-hidden">
            {/* Brand panel */}

            <section className="relative isolate flex min-w-0 flex-col justify-between overflow-hidden border-b border-(--color-border-strong) bg-[#15120e] px-6 py-6 sm:px-12 sm:py-8 lg:h-dvh lg:min-h-0 lg:border-b-0 lg:border-r lg:px-14 lg:py-10 xl:px-20 xl:py-12">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_18%_18%,rgba(194,151,81,0.19),transparent_42%),radial-gradient(ellipse_at_85%_80%,rgba(112,77,37,0.16),transparent_45%),linear-gradient(145deg,#1b1812_0%,#100f0d_48%,#080807_100%)]" />

                <div className="pointer-events-none absolute -right-32 top-1/4 -z-10 h-[420px] w-[420px] rounded-full border border-[#c6a46b]/10" />

                <div className="pointer-events-none absolute -right-20 top-[30%] -z-10 h-[320px] w-[320px] rounded-full border border-[#c6a46b]/[0.07]" />

                <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-px w-full bg-gradient-to-r from-transparent via-[#b99a62]/50 to-transparent lg:hidden" />

                {/* Clickable logo */}

                <Link
                    href="/"
                    aria-label="Glowa Vee home"
                    className="relative z-10 inline-flex w-fit shrink-0 rounded-sm transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-gold)"
                >
                    <GlowaVeeLogo />
                </Link>

                {/* Main message */}

                <div className="relative my-7 max-w-2xl sm:my-9 lg:my-auto lg:py-10">
                    <p className="mb-3 font-body text-[9px] font-bold uppercase tracking-[0.28em] text-(--color-gold) sm:mb-5">
                        {eyebrow}
                    </p>

                    <h1 className="max-w-2xl break-words font-display text-3xl font-medium leading-[1.05] tracking-tight text-[#e9d9bd] sm:text-5xl lg:text-6xl xl:text-7xl">
                        {title}
                    </h1>

                    <div className="my-4 h-px w-16 gold-foil opacity-80 sm:my-7" />

                    <p className="max-w-md font-body text-xs leading-6 text-[#c0b7a7] sm:text-sm sm:leading-8">
                        {description}
                    </p>
                </div>

                {/* Back to home */}

                <div className="flex shrink-0 items-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b99a62] transition-opacity hover:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-gold)"
                    >
                        <ArrowLeft size={14} strokeWidth={1.8} />
                        <span>Back to home</span>
                    </Link>
                </div>
            </section>

            {/* Form panel */}

            <section
                className={`relative flex min-h-0 min-w-0 flex-col bg-(--color-background) lg:h-dvh ${
                    formScrollable
                        ? 'overflow-visible lg:overflow-y-auto lg:overscroll-y-contain'
                        : 'overflow-visible lg:overflow-hidden'
                }`}
            >
                <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 bg-[radial-gradient(circle,rgba(190,151,87,0.055),transparent_70%)]" />

                <div
                    className={`relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 sm:px-10 lg:w-[90%] lg:px-0 ${
                        formScrollable
                            ? 'py-8 sm:py-10 lg:py-10'
                            : 'py-7 sm:py-9 lg:py-5'
                    }`}
                >
                    <div className="mb-5 sm:mb-7">
                        <p className="font-body text-[9px] font-bold uppercase tracking-[0.24em] text-(--color-gold)">
                            Client portal
                        </p>

                        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--color-text) sm:mt-3 sm:text-4xl">
                            {formTitle}
                        </h2>

                        <p className="mt-2 text-xs leading-relaxed text-(--color-text-muted)">
                            {formDescription}
                        </p>
                    </div>

                    {children}
                </div>
            </section>
        </main>
    );
}
