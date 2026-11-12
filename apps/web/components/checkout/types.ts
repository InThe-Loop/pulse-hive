export interface CartItem {
    id?: string;
    name?: string;
    price?: number;
    quantity?: number;
    image?: string;
    imageUrl?: string;
    productImage?: string;
    thumbnail?: string;
    [key: string]: any;
}

export interface ShippingOption {
    id?: string;
    name?: string;
    fee?: number;
    [key: string]: any;
}

export interface CustomerProfile {
    id?: string;
    name?: string;
    phone?: string;
    address?: string | {
        street?: string;
        streetAddress?: string;
        addressLine1?: string;
        suburb?: string;
        district?: string;
        city?: string;
        town?: string;
        postalCode?: string;
        postcode?: string;
    } | null;
}

export interface OzowResponse {
    gatewayUrl?: string;
    paymentRequestId?: string;
    error?: string | null;
    message?: string;
}

export interface CheckoutFormValues {
    customerName: string;
    phoneNumber: string;
    lockerName: string;
    street: string;
    suburb: string;
    city: string;
    postalCode: string;
}
