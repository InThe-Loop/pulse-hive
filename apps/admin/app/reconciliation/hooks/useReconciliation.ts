import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { apiCall } from '@/lib/api-client';

import type {
    ApiOrder,
    Order,
} from '../../orders/lib/orders.types';

import { mapOrder } from '../../orders/lib/orders.utils';

const REFRESH_INTERVAL_MS = 60_000;

export function useReconciliation(enabled: boolean) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchOrders = useCallback(async (initialLoad = false) => {
        if (initialLoad) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        setError('');

        try {
            // Reuse the existing tenant-authorized Orders endpoint.
            // Its response already includes associated gateway payments.
            const response = await apiCall<ApiOrder[]>('/orders');

            if (!Array.isArray(response)) {
                throw new Error(
                    'The Orders service returned an unexpected response.',
                );
            }

            setOrders(response.map(mapOrder));
            setLastUpdated(new Date());
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load reconciliation records.',
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        void fetchOrders(true);

        const intervalId = window.setInterval(
            () => void fetchOrders(),
            REFRESH_INTERVAL_MS,
        );

        return () => {
            window.clearInterval(intervalId);
        };
    }, [enabled, fetchOrders]);

    return {
        orders,
        loading,
        refreshing,
        error,
        lastUpdated,
        refresh: () => fetchOrders(),
        retry: () => fetchOrders(true),
    };
}