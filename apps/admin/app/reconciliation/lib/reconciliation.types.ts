import type { Order } from '../../orders/lib/orders.types';

export type ReconciliationStatus =
    | 'MATCHED'
    | 'PARTIAL'
    | 'PENDING'
    | 'REVIEW';

export type ReconciliationStatusFilter =
    | 'ALL'
    | ReconciliationStatus;

export type ReconciliationDateRange =
    | 'ALL'
    | 'TODAY'
    | '7D'
    | '30D';

export interface ReconciliationRecord {
    order: Order;
    status: ReconciliationStatus;
    completedAmount: number;
    balance: number;
    completedPaymentCount: number;
    currencyMismatch: boolean;
    reason: string;
}