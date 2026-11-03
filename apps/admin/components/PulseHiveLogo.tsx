import Link from 'next/link';

type PulseHiveLogoProps = {
    showTagline?: boolean;
};

export const PulseHiveLogo = ({
    showTagline = true,
}: PulseHiveLogoProps) => (
    <Link
        href="/"
        aria-label="PulseHive home"
        className="inline-flex flex-col items-start rounded-sm no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
    >
        <div className="flex items-center gap-1.5 font-black text-xl tracking-tighter text-white">
            <div className="relative">
                <div className="h-4 w-4 animate-pulse rounded-full bg-indigo-500"></div>
                <div className="absolute inset-0 h-4 w-4 animate-ping rounded-full bg-indigo-500 opacity-75"></div>
            </div>

            <span>
                PulseHive<span className="text-indigo-400">.</span>
            </span>
        </div>

        {showTagline && (
            <span className="text-[10px] font-semibold tracking-wide text-slate-400">
                Move. Manage. Multiply.
            </span>
        )}
    </Link>
);