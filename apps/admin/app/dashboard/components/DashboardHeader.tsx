type DashboardHeaderProps = {
    error: string;
    loading: boolean;
    lastUpdated: Date | null;
    onRefresh: () => void;
};

export default function DashboardHeader({
    error,
    loading,
    lastUpdated,
    onRefresh,
}: DashboardHeaderProps) {
    return (
        <div className="flex flex-col justify-between gap-4 border-b border-white/6 pb-6 sm:flex-row sm:items-center">
            <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                    Operational Status Summary
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white">
                    Business Overview
                </h1>

                <p className="mt-2 text-xs text-slate-500">
                    {lastUpdated
                        ? `Last updated ${lastUpdated.toLocaleTimeString('en-ZA', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}`
                        : 'Live data from your orders'}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/2 px-4 py-2 text-xs font-semibold text-slate-300">
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${
                            error ? 'bg-amber-400' : 'animate-pulse bg-emerald-400'
                        }`}
                    />
                    {error ? 'Connection issue' : 'Connected'}
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
        </div>
    );
}
