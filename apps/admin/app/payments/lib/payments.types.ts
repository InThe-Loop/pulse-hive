export type PaymentStatus =
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED'
    | string;

export type PaymentDateRange = 'ALL' | 'TODAY' | '7D' | '30D';

export interface PaymentRecord {
    id: string;
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
    amount: number | string;
    currency?: string | null;
    provider: string;
    providerReference?: string | null;
    transactionReference?: string | null;
    paymentRequestId?: string | null;
    status: PaymentStatus;
    providerStatusMessage?: string | null;
    createdAt: string;
    completedAt?: string | null;
    updatedAt?: string | null;
    order?: {
        id: string;
        reference: string;
    } | null;
}

export interface PaymentSummary {
    completedCount: number;
    failedCount: number;
    completedValue: string;
    pendingValue: string;
}
