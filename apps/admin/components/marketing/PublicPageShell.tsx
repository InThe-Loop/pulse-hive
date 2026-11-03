import type { ReactNode } from 'react';

interface PublicPageShellProps {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
}

export default function PublicPageShell({
    eyebrow,
    title,
    description,
    children,
}: PublicPageShellProps) {
    return (
        <div className="mx-auto w-full max-w-8xl space-y-10 pb-12 text-white sm:space-y-12">
            <header className="relative isolate overflow-hidden rounded-3xl border border-white/8 bg-slate-900/45 px-6 py-10 shadow-2xl shadow-slate-950/20 sm:px-10 sm:py-14 lg:px-14">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-size-[32px_32px]"
                />

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"
                />

                <div className="max-w-3xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.07] px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200">
                            {eyebrow}
                        </span>
                    </div>

                    <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {title}
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                        {description}
                    </p>
                </div>
            </header>

            <div className="space-y-10 sm:space-y-12">
                {children}
            </div>
        </div>
    );
}