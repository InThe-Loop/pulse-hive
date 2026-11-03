export type OrderStatus =
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'PROCESSING'
    | 'READY_TO_SHIP'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED';

export type PaymentStatus =
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED';

export type FulfilmentStatus =
    | 'NOT_STARTED'
    | 'PROCESSING'
    | 'PACKED'
    | 'READY_FOR_DISPATCH'
    | 'DISPATCHED'
    | 'DELIVERED'
    | 'ON_HOLD'
    | 'DELIVERY_FAILED';

export interface ApiFulfilmentHistoryEntry {
    id: string;
    previousStatus?: FulfilmentStatus | null;
    newStatus: FulfilmentStatus;
    actorUserId?: string | null;
    note?: string | null;
    createdAt: string;
}

export interface ApiOrderFulfilment {
    id: string;
    orderId: string;
    status: FulfilmentStatus;
    deliveryProvider?: string | null;
    trackingReference?: string | null;
    operationalNotes?: string | null;
    startedAt?: string | null;
    packedAt?: string | null;
    readyForDispatchAt?: string | null;
    dispatchedAt?: string | null;
    deliveredAt?: string | null;
    createdAt: string;
    updatedAt: string;
    history?: ApiFulfilmentHistoryEntry[];
}

export type PaymentLabel = 'PENDING' | 'PAID' | 'PARTIAL' | 'FLAGGED';
export type DateRange = 'ALL' | 'TODAY' | '7D' | '30D';
export type SortOrder = 'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST' | 'STAGE_OLDEST' | 'UPDATED';

export interface ApiCustomer {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
}

export interface ApiOrderItem {
    id: string;
    productName: string;
    sku?: string | null;
    quantity: number;
    unitPrice: number | string;
    totalPrice: number | string;
}

export interface ApiPayment {
    id: string;
    amount: number | string;
    currency?: string;
    provider?: string;
    providerReference?: string | null;
    transactionReference?: string | null;
    paymentRequestId?: string | null;
    status: PaymentStatus;
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    providerStatusMessage?: string | null;
    createdAt: string;
    completedAt?: string | null;
    updatedAt?: string;
}

export interface ApiOrder {
    id: string;
    reference: string;
    totalAmount: number | string;
    subtotal?: number | string;
    shippingFee?: number | string;
    shippingMethod?: string | null;
    deliveryAddress?: string | null;
    trackingNumber?: string | null;
    createdAt: string;
    updatedAt?: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    customer: ApiCustomer | null;
    items: ApiOrderItem[];
    payments: ApiPayment[];
    fulfilment?: ApiOrderFulfilment | null;
}

export interface Order {
    id: string;
    reference: string;
    createdAt: string;
    updatedAt?: string;
    status: OrderStatus;
    rawPaymentStatus: PaymentStatus;
    paymentStatus: PaymentLabel;
    customerName: string;
    contactNumber: string;
    email: string;
    customerAddress: string;
    items: ApiOrderItem[];
    itemsSummary: string;
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    shippingMethod: string;
    deliveryAddress: string;
    trackingNumber: string;
    payments: ApiPayment[];
    fulfilment?: ApiOrderFulfilment | null;
    isLocalDraft?: boolean;
}
