import type { Activity } from '../types/dashboard.types';
import { relativeTime } from '../lib/dashboard.utils';

export default function RecentActivity({ activity }: { activity: Activity[] }) {
    return (
        <div className="ph-glass-panel p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-md font-bold text-white">
                    <span className="text-emerald-400">✨</span>
                    Recent Store Activity
                </h3>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    From order records
                </span>
            </div>

            {activity.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-white/2 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-slate-300">
                        No activity to show yet
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        New orders and payment records will appear here.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {activity.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-start justify-between gap-4 py-3 ${
                                index < activity.length - 1 ? 'border-b border-white/4' : ''
                            }`}
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <span
                                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                                        item.kind === 'payment' ? 'bg-emerald-400' : 'bg-indigo-400'
                                    }`}
                                />

                                <div className="min-w-0">
                                    <p className="truncate font-sans text-xs font-semibold text-slate-300">
                                        {item.title}
                                    </p>

                                    <p className="mt-1 truncate font-sans text-[10px] text-slate-500">
                                        {item.detail}
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0 pt-0.5 font-mono text-[10px] text-slate-500">
                                {relativeTime(item.timestamp)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
