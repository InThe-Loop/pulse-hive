import Link from 'next/link';

export default function PublicFooter() {
    return (
        <footer className="mx-auto mt-16 flex w-full max-w-8xl flex-col justify-between gap-5 border-t border-white/8 px-4 pt-7 pb-7 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div>
                <p className="font-black tracking-tight text-white">
                    PulseHive<span className="text-indigo-400">.</span>
                </p>

                <p className="mt-1">
                    Move. Manage. Multiply.
                </p>
            </div>

            <nav
                aria-label="Footer navigation"
                className="flex flex-wrap gap-x-5 gap-y-3"
            >
                <Link href="/about" className="transition hover:text-slate-300">
                    About
                </Link>

                <Link href="/pricing" className="transition hover:text-slate-300">
                    Pricing
                </Link>

                <Link href="/contact" className="transition hover:text-slate-300">
                    Contact
                </Link>

                <Link href="/auth/login" className="transition hover:text-slate-300">
                    Workspace sign in
                </Link>
            </nav>

            <p>© {new Date().getFullYear()} PulseHive</p>
        </footer>
    );
}