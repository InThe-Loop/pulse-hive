import type { ChartPeriod, DailyMetric } from '../types/dashboard.types';
import { compactMoney, money } from '../lib/dashboard.utils';

const CHART_WIDTH = 720;
const CHART_HEIGHT = 260;
const CHART_PADDING = {
    top: 22,
    right: 18,
    bottom: 38,
    left: 68,
};

function ChartPeriodSelector({
    value,
    onChange,
}: {
    value: ChartPeriod;
    onChange: (period: ChartPeriod) => void;
}) {
    return (
        <div
            className="inline-flex shrink-0 rounded-lg border border-white/8 bg-slate-950/70 p-1"
            role="group"
            aria-label="Chart date range"
        >
            {([7, 30] as const).map((period) => (
                <button
                    key={period}
                    type="button"
                    onClick={() => onChange(period)}
                    aria-pressed={value === period}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-all ${
                        value === period
                            ? 'border border-indigo-400/25 bg-indigo-500/15 text-indigo-200 shadow-[0_0_18px_rgba(99,102,241,0.12)]'
                            : 'border border-transparent text-slate-500 hover:text-slate-200'
                    }`}
                >
                    {period} days
                </button>
            ))}
        </div>
    );
}

function ChartEmptyState({
    message,
}: {
    message: string;
}) {
    return (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-white/8 bg-white/1.5 px-6 text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-lg text-slate-500">
                ∅
            </span>
            <p className="text-sm font-semibold text-slate-300">
                Nothing recorded in this period
            </p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                {message}
            </p>
        </div>
    );
}

function RevenueTrendChart({
    data,
    period,
}: {
    data: DailyMetric[];
    period: ChartPeriod;
}) {
    const chartWidth = CHART_WIDTH;
    const chartHeight = CHART_HEIGHT;

    const plotWidth =
        chartWidth - CHART_PADDING.left - CHART_PADDING.right;

    const plotHeight =
        chartHeight - CHART_PADDING.top - CHART_PADDING.bottom;

    const totalRevenue = data.reduce(
        (sum, day) => sum + day.revenue,
        0,
    );

    const peakRevenue = Math.max(
        0,
        ...data.map((day) => day.revenue),
    );

    const yMaximum = peakRevenue > 0
        ? peakRevenue * 1.15
        : 100;

    const yTicks = Array.from(
        { length: 5 },
        (_, index) => (yMaximum / 4) * index,
    ).reverse();

    const points = data.map((day, index) => {
        const x = CHART_PADDING.left
            + (data.length > 1
                ? (index / (data.length - 1)) * plotWidth
                : plotWidth / 2);

        const y = CHART_PADDING.top
            + plotHeight
            - (day.revenue / yMaximum) * plotHeight;

        return {
            ...day,
            x,
            y,
        };
    });

    const linePath = points
        .map((point, index) =>
            `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
        )
        .join(' ');

    const baselineY = CHART_PADDING.top + plotHeight;

    const areaPath = points.length
        ? `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
        : '';

    const labelStep = period === 7 ? 1 : 5;

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Completed payment value
                    </p>
                    <div className="font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
                        {money(totalRevenue)}
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                        Across the selected {period}-day period
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/4 px-3 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-200/80">
                        Completed payments only
                    </span>
                </div>
            </div>

            <div className="relative">
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="block w-full overflow-visible"
                    role="img"
                    aria-label={`Daily completed payment revenue for the last ${period} days. Total ${money(totalRevenue)}.`}
                >
                    <defs>
                        <linearGradient
                            id="revenue-area-gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#818cf8"
                                stopOpacity="0.28"
                            />
                            <stop
                                offset="65%"
                                stopColor="#6366f1"
                                stopOpacity="0.08"
                            />
                            <stop
                                offset="100%"
                                stopColor="#6366f1"
                                stopOpacity="0"
                            />
                        </linearGradient>

                        <linearGradient
                            id="revenue-line-gradient"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="55%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#67e8f9" />
                        </linearGradient>

                        <filter
                            id="revenue-line-glow"
                            x="-30%"
                            y="-50%"
                            width="160%"
                            height="200%"
                        >
                            <feGaussianBlur
                                stdDeviation="3"
                                result="blur"
                            />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {yTicks.map((tick, index) => {
                        const y = CHART_PADDING.top
                            + (index / 4) * plotHeight;

                        return (
                            <g key={index}>
                                <line
                                    x1={CHART_PADDING.left}
                                    x2={chartWidth - CHART_PADDING.right}
                                    y1={y}
                                    y2={y}
                                    stroke="rgba(148,163,184,0.12)"
                                    strokeDasharray="3 6"
                                />
                                <text
                                    x={CHART_PADDING.left - 10}
                                    y={y + 4}
                                    textAnchor="end"
                                    fill="#64748b"
                                    fontSize="10"
                                >
                                    {compactMoney(tick)}
                                </text>
                            </g>
                        );
                    })}

                    <line
                        x1={CHART_PADDING.left}
                        x2={chartWidth - CHART_PADDING.right}
                        y1={baselineY}
                        y2={baselineY}
                        stroke="rgba(148,163,184,0.18)"
                    />

                    {areaPath && (
                        <path
                            d={areaPath}
                            fill="url(#revenue-area-gradient)"
                        />
                    )}

                    {points.length > 1 && (
                        <path
                            d={linePath}
                            fill="none"
                            stroke="url(#revenue-line-gradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#revenue-line-glow)"
                            opacity="0.95"
                        />
                    )}

                    {points.map((point, index) => {
                        const showLabel =
                            index % labelStep === 0
                            || index === points.length - 1;

                        return (
                            <g key={point.key}>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="10"
                                    fill="#818cf8"
                                    opacity="0"
                                    className="transition-opacity hover:opacity-10"
                                />

                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r={point.revenue > 0 ? 3.5 : 2}
                                    fill={point.revenue > 0 ? '#a5b4fc' : '#475569'}
                                    stroke={point.revenue > 0 ? '#312e81' : '#1e293b'}
                                    strokeWidth="1.5"
                                >
                                    <title>
                                        {`${point.fullLabel}: ${money(point.revenue)}`}
                                    </title>
                                </circle>

                                {showLabel && (
                                    <text
                                        x={point.x}
                                        y={chartHeight - 12}
                                        textAnchor="middle"
                                        fill="#64748b"
                                        fontSize={period === 7 ? '10' : '9'}
                                    >
                                        {point.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-4 text-[10px] text-slate-500">
                <span>Daily totals in ZAR</span>
                <span>
                    Peak day: {money(peakRevenue)}
                </span>
            </div>
        </div>
    );
}


function OrderVolumeChart({
    data,
    period,
}: {
    data: DailyMetric[];
    period: ChartPeriod;
}) {
    const chartWidth = CHART_WIDTH;
    const chartHeight = CHART_HEIGHT;

    const plotWidth =
        chartWidth - CHART_PADDING.left - CHART_PADDING.right;

    const plotHeight =
        chartHeight - CHART_PADDING.top - CHART_PADDING.bottom;

    const totalOrders = data.reduce(
        (sum, day) => sum + day.orders,
        0,
    );

    const peakOrders = Math.max(
        0,
        ...data.map((day) => day.orders),
    );

    const yMaximum = Math.max(4, Math.ceil(peakOrders * 1.2));

    const tickCount = 4;

    const yTicks = Array.from(
        { length: tickCount + 1 },
        (_, index) =>
            Math.ceil((yMaximum / tickCount) * (tickCount - index)),
    );

    const labelStep = period === 7 ? 1 : 5;

    const slotWidth = plotWidth / data.length;
    const barWidth = Math.min(
        period === 7 ? 38 : 15,
        slotWidth * 0.56,
    );

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Orders created
                    </p>
                    <div className="font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
                        {totalOrders.toLocaleString('en-ZA')}
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                        New orders recorded in {period} days
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-indigo-400/10 bg-indigo-400/4 px-3 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    <span className="text-[10px] font-semibold text-indigo-200/80">
                        Order creation date
                    </span>
                </div>
            </div>

            <div>
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="block w-full overflow-visible"
                    role="img"
                    aria-label={`Daily order volume for the last ${period} days. ${totalOrders} orders created.`}
                >
                    <defs>
                        <linearGradient
                            id="order-bar-gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#a78bfa"
                                stopOpacity="0.95"
                            />
                            <stop
                                offset="100%"
                                stopColor="#6366f1"
                                stopOpacity="0.55"
                            />
                        </linearGradient>

                        <filter
                            id="order-bar-glow"
                            x="-50%"
                            y="-20%"
                            width="200%"
                            height="140%"
                        >
                            <feGaussianBlur
                                stdDeviation="3"
                                result="blur"
                            />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {yTicks.map((tick, index) => {
                        const y = CHART_PADDING.top
                            + (index / tickCount) * plotHeight;

                        return (
                            <g key={`${tick}-${index}`}>
                                <line
                                    x1={CHART_PADDING.left}
                                    x2={chartWidth - CHART_PADDING.right}
                                    y1={y}
                                    y2={y}
                                    stroke="rgba(148,163,184,0.12)"
                                    strokeDasharray="3 6"
                                />

                                <text
                                    x={CHART_PADDING.left - 10}
                                    y={y + 4}
                                    textAnchor="end"
                                    fill="#64748b"
                                    fontSize="10"
                                >
                                    {tick.toLocaleString('en-ZA')}
                                </text>
                            </g>
                        );
                    })}

                    <line
                        x1={CHART_PADDING.left}
                        x2={chartWidth - CHART_PADDING.right}
                        y1={CHART_PADDING.top + plotHeight}
                        y2={CHART_PADDING.top + plotHeight}
                        stroke="rgba(148,163,184,0.18)"
                    />

                    {data.map((day, index) => {
                        const x = CHART_PADDING.left
                            + index * slotWidth
                            + (slotWidth - barWidth) / 2;

                        const barHeight =
                            (day.orders / yMaximum) * plotHeight;

                        const y =
                            CHART_PADDING.top + plotHeight - barHeight;

                        const showLabel =
                            index % labelStep === 0
                            || index === data.length - 1;

                        return (
                            <g key={day.key}>
                                {day.orders > 0 && (
                                    <rect
                                        x={x - 2}
                                        y={y - 2}
                                        width={barWidth + 4}
                                        height={Math.max(2, barHeight + 4)}
                                        rx="5"
                                        fill="#818cf8"
                                        opacity="0.12"
                                        filter="url(#order-bar-glow)"
                                    />
                                )}

                                <rect
                                    x={x}
                                    y={day.orders > 0 ? y : CHART_PADDING.top + plotHeight - 2}
                                    width={barWidth}
                                    height={Math.max(2, barHeight)}
                                    rx="3"
                                    fill={day.orders > 0 ? 'url(#order-bar-gradient)' : '#334155'}
                                    opacity={day.orders > 0 ? 1 : 0.55}
                                >
                                    <title>
                                        {`${day.fullLabel}: ${day.orders} ${day.orders === 1 ? 'order' : 'orders'}`}
                                    </title>
                                </rect>

                                {day.orders > 0 && period === 7 && (
                                    <text
                                        x={x + barWidth / 2}
                                        y={Math.max(CHART_PADDING.top + 11, y - 8)}
                                        textAnchor="middle"
                                        fill="#c4b5fd"
                                        fontSize="10"
                                        fontWeight="600"
                                    >
                                        {day.orders}
                                    </text>
                                )}

                                {showLabel && (
                                    <text
                                        x={CHART_PADDING.left + index * slotWidth + slotWidth / 2}
                                        y={chartHeight - 12}
                                        textAnchor="middle"
                                        fill="#64748b"
                                        fontSize={period === 7 ? '10' : '9'}
                                    >
                                        {day.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-4 text-[10px] text-slate-500">
                <span>One bar per calendar day</span>
                <span>
                    Peak day: {peakOrders.toLocaleString('en-ZA')} {peakOrders === 1 ? 'order' : 'orders'}
                </span>
            </div>
        </div>
    );
}

export default function SalesAnalytics({
    data,
    period,
    onPeriodChange,
}: {
    data: DailyMetric[];
    period: ChartPeriod;
    onPeriodChange: (period: ChartPeriod) => void;
}) {
    const chartSummary = {
        revenue: data.reduce((sum, day) => sum + day.revenue, 0),
        orders: data.reduce((sum, day) => sum + day.orders, 0),
    };

    return (
        <section className="space-y-6" aria-labelledby="analytics-heading">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                            Business intelligence
                        </span>
                    </div>

                    <h2
                        id="analytics-heading"
                        className="text-2xl font-black tracking-tight text-white"
                    >
                        Sales &amp; Order Analytics
                    </h2>

                    <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                        Track completed payment revenue and order activity across your workspace.
                    </p>
                </div>

                <ChartPeriodSelector value={period} onChange={onPeriodChange} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="ph-glass-panel min-w-0 overflow-hidden p-5 sm:p-6">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-white">Revenue Trend</h3>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Daily completed payments
                            </p>
                        </div>

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07] text-lg text-indigo-300">
                            ↗
                        </span>
                    </div>

                    {chartSummary.revenue === 0 ? (
                        <ChartEmptyState
                            message={`No completed payments were recorded in the selected ${period}-day period. The revenue trend will appear when payments are completed.`}
                        />
                    ) : (
                        <RevenueTrendChart data={data} period={period} />
                    )}
                </div>

                <div className="ph-glass-panel min-w-0 overflow-hidden p-5 sm:p-6">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-white">Order Volume</h3>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Orders created per day
                            </p>
                        </div>

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.07] text-lg text-violet-300">
                            ▥
                        </span>
                    </div>

                    {chartSummary.orders === 0 ? (
                        <ChartEmptyState
                            message={`No orders were created in the selected ${period}-day period. The chart will show daily order counts as new orders arrive.`}
                        />
                    ) : (
                        <OrderVolumeChart data={data} period={period} />
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-indigo-300">ⓘ</span>
                    <p className="text-[10px] leading-5 text-slate-400">
                        Revenue is grouped by payment completion date. Order volume is grouped by
                        order creation date. Only completed payments contribute to the revenue charts.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-4 text-[10px] font-medium text-slate-500">
                    <span>
                        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        {chartSummary.orders.toLocaleString('en-ZA')} orders
                    </span>

                    <span>
                        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {money(chartSummary.revenue)}
                    </span>
                </div>
            </div>
        </section>
    );
}
