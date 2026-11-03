'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiCall } from '@/lib/api-client';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import DashboardHeader from './components/DashboardHeader';
import DashboardOverview, { PerformanceMetrics } from './components/DashboardOverview';
import RecentActivity from './components/RecentActivity';
import SalesAnalytics from './components/SalesAnalytics';
import type { ChartPeriod, DashboardStats, Order } from './types/dashboard.types';
import {
    amount,
    buildActivity,
    buildDailyMetrics,
    orderRevenue,
    paid,
    pendingPayment,
} from './lib/dashboard.utils';

const REFRESH_INTERVAL_MS = 60_000;

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [clock, setClock] = useState(Date.now());
    const [chartPeriod, setChartPeriod] = useState<ChartPeriod>(7);

    const { isAuthenticated, isChecking } = useAuthGuard();

    const fetchOrders = useCallback(async (showLoading = false) => {
        if (showLoading) {
            setLoading(true);
        }

        setError('');

        try {
            const response = await apiCall<Order[]>('/orders');

            setOrders(Array.isArray(response) ? response : []);
            setLastUpdated(new Date());
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load dashboard data.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isChecking || !isAuthenticated) {
            return;
        }

        void fetchOrders(true);

        const refreshTimer = window.setInterval(
            () => void fetchOrders(),
            REFRESH_INTERVAL_MS,
        );

        const clockTimer = window.setInterval(
            () => setClock(Date.now()),
            30_000,
        );

        return () => {
            window.clearInterval(refreshTimer);
            window.clearInterval(clockTimer);
        };
    }, [fetchOrders, isAuthenticated, isChecking]);

    const stats = useMemo<DashboardStats>(() => {
        const paidOrders = orders.filter(paid).length;

        const deliveredOrders = orders.filter(
            (order) =>
                order.fulfilment?.status === 'DELIVERED'
                || order.status === 'DELIVERED',
        ).length;

        return {
            totalOrders: orders.length,
            totalRevenue: orders.reduce(
                (sum, order) => sum + orderRevenue(order),
                0,
            ),
            pendingPayments: orders.filter(pendingPayment).length,
            readyToShip: orders.filter(
                (order) =>
                    paid(order)
                    && (
                        !order.fulfilment?.status
                        || [
                            'NOT_STARTED',
                            'PROCESSING',
                            'PACKED',
                            'READY_FOR_DISPATCH',
                        ].includes(order.fulfilment.status)
                    ),
            ).length,
            averageOrderValue: orders.length
                ? orders.reduce(
                    (sum, order) => sum + amount(order.totalAmount),
                    0,
                ) / orders.length
                : 0,
            paidOrderRate: orders.length
                ? (paidOrders / orders.length) * 100
                : 0,
            fulfilmentCompletionRate: paidOrders
                ? (deliveredOrders / paidOrders) * 100
                : 0,
            paidOrders,
            deliveredOrders,
        };
    }, [orders]);

    const chartData = useMemo(
        () => buildDailyMetrics(orders, chartPeriod, new Date(clock)),
        [orders, chartPeriod, clock],
    );

    const activity = useMemo(
        () => buildActivity(orders),
        [orders, clock],
    );

    if (isChecking || !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Checking session...</p>
            </div>
        );
    }

    if (loading && orders.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center font-mono text-xs tracking-widest text-slate-500">
                <span className="mr-3 h-2 w-2 animate-ping rounded-full bg-indigo-500" />
                LOADING YOUR OVERVIEW...
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <DashboardHeader
                error={error}
                loading={loading}
                lastUpdated={lastUpdated}
                onRefresh={() => void fetchOrders(true)}
            />

            {error && (
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold text-amber-300">
                            We couldn't refresh your dashboard data.
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void fetchOrders(true)}
                        className="rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/10"
                    >
                        Try again
                    </button>
                </div>
            )}

            <DashboardOverview stats={stats} />

            <SalesAnalytics
                data={chartData}
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PerformanceMetrics stats={stats} />
                <RecentActivity activity={activity} />
            </div>
        </div>
    );
}
