export type Payment = {
    id: string;
    amount: number | string;
    status: string;
    provider?: string | null;
    createdAt: string;
    completedAt?: string | null;
    updatedAt?: string | null;
};

export type Order = {
    id: string;
    reference: string;
    totalAmount: number | string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    customer?: { name?: string | null } | null;
    payments: Payment[];
    fulfilment?: { status: string } | null;
};

export type Activity = {
    id: string;
    title: string;
    detail: string;
    timestamp: string;
    kind: 'order' | 'payment';
};

export type ChartPeriod = 7 | 30;

export type DailyMetric = {
    key: string;
    label: string;
    fullLabel: string;
    revenue: number;
    orders: number;
};

export type DashboardStats = {
    totalOrders: number;
    totalRevenue: number;
    pendingPayments: number;
    readyToShip: number;
    averageOrderValue: number;
    paidOrderRate: number;
    fulfilmentCompletionRate: number;
    paidOrders: number;
    deliveredOrders: number;
};
