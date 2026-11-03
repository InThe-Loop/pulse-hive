'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiCall } from '@/lib/api-client';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

import type { PaymentRecord } from '../lib/payments.types';

const REFRESH_INTERVAL_MS = 60_000;

export function usePayments() {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const { isAuthenticated, isChecking } = useAuthGuard();

    const fetchPayments = useCallback(async (initialLoad = false) => {
        if (initialLoad) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        setError('');

        try {
            const response = await apiCall<PaymentRecord[]>('/payments');

            setPayments(Array.isArray(response) ? response : []);
            setLastUpdated(new Date());
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load payment records. Please try again.',
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isChecking || !isAuthenticated) {
            return;
        }

        void fetchPayments(true);

        const refreshTimer = window.setInterval(
            () => void fetchPayments(),
            REFRESH_INTERVAL_MS,
        );

        return () => {
            window.clearInterval(refreshTimer);
        };
    }, [fetchPayments, isAuthenticated, isChecking]);

    return {
        payments,
        loading,
        refreshing,
        error,
        lastUpdated,
        fetchPayments,
        isAuthenticated,
        isChecking,
    };
}
