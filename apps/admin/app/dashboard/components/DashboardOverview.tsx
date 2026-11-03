import type { DashboardStats } from '../types/dashboard.types';
import { money } from '../lib/dashboard.utils';

function MetricCard({
    label,
    value,
    description,
    badge,
    valueClassName = 'text-white',
}: {
    label: string;
    value: string;
    description: string;
    badge: string;
    valueClassName?: string;
}) {
    return (
        <div className="ph-glass-panel p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                </span>
                <span className="rounded-md border border-white/8 bg-white/3 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    {badge}
                </span>
            </div>

            <div className={`mb-2 font-mono text-3xl font-black tracking-tight ${valueClassName}`}>
                {value}
            </div>

            <div className="text-[11px] font-medium text-slate-500">
                {description}
            </div>
        </div>
    );
}

function ProgressMetric({
    label,
    value,
    description,
    gradient,
}: {
    label: string;
    value: number;
    description: string;
    gradient: string;
}) {
    const safeValue = Math.max(0, Math.min(100, value));

    return (
        <div>
            <div className="mb-2 flex justify-between gap-4 text-xs font-semibold text-slate-400">
                <span>{label}</span>
                <span className="shrink-0 font-mono text-white">
                    {safeValue.toFixed(1)}%
                </span>
            </div>

            <div
                className="h-1.5 overflow-hidden rounded-full border border-white/4 bg-slate-950"
                role="progressbar"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={safeValue}
            >
                <div
                    className={`h-full rounded-full bg-linear-to-r ${gradient}`}
                    style={{ width: `${safeValue}%` }}
                />
            </div>

            <p className="mt-2 text-[10px] text-slate-500">
                {description}
            </p>
        </div>
    );
}

export default function DashboardOverview({ stats }: { stats: DashboardStats }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                label="Total Sales Made"
                value={money(stats.totalRevenue)}
                description="Recorded completed payments"
                badge="From payments"
            />

            <MetricCard
                label="Total Orders Booked"
                value={stats.totalOrders.toLocaleString('en-ZA')}
                description="Orders returned for your selected workspace"
                badge="All channels"
            />

            <MetricCard
                label="Awaiting Payment"
                value={stats.pendingPayments.toLocaleString('en-ZA')}
                description="Orders without a completed payment"
                badge="Needs attention"
                valueClassName="text-amber-400"
            />

            <MetricCard
                label="Ready to Pack & Ship"
                value={stats.readyToShip.toLocaleString('en-ZA')}
                description="Paid orders not yet dispatched"
                badge="Paid orders"
                valueClassName="text-blue-400"
            />
        </div>
    );
}

export function PerformanceMetrics({ stats }: { stats: DashboardStats }) {
    return (
        <div className="ph-glass-panel p-6">
            <h3 className="mb-6 flex items-center gap-2 text-md font-bold text-white">
                <span className="text-indigo-400">📊</span>
                Performance Metrics
            </h3>

            {stats.totalOrders === 0 ? (
                <p className="text-xs text-slate-500">
                    Performance metrics will appear when this workspace has orders.
                </p>
            ) : (
                <div className="flex flex-col gap-7">
                    <ProgressMetric
                        label="Paid Order Rate"
                        value={stats.paidOrderRate}
                        description={`${stats.paidOrders} of ${stats.totalOrders} orders have a completed payment or paid order status.`}
                        gradient="from-indigo-500 to-purple-500"
                    />

                    <div>
                        <div className="mb-2 flex justify-between gap-4 text-xs font-semibold text-slate-400">
                            <span>Average Order Value</span>
                            <span className="shrink-0 font-mono text-white">
                                {money(stats.averageOrderValue)}
                            </span>
                        </div>

                        <p className="text-[10px] text-slate-500">
                            Calculated from the total value of recorded orders.
                        </p>
                    </div>

                    <ProgressMetric
                        label="Fulfilment Completion Rate"
                        value={stats.fulfilmentCompletionRate}
                        description={`${stats.deliveredOrders} delivered orders out of ${stats.paidOrders} paid orders.`}
                        gradient="from-emerald-500 to-teal-500"
                    />
                </div>
            )}
        </div>
    );
}
