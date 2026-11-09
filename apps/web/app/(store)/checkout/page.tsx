'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    UserPlus,
    Lock,
    ShieldCheck,
    LogIn,
    Sparkles,
    MapPin,
    Home,
} from 'lucide-react';

import { useCart } from '@/context/cart-context';
import Image from 'next/image';

interface CartItem {
    id?: string;
    name?: string;
    price?: number;
    quantity?: number;
    [key: string]: any;
}

interface ShippingOption {
    id?: string;
    name?: string;
    fee?: number;
    [key: string]: any;
}

/**
 * Response returned by our Next.js Ozow API route.
 *
 * IMPORTANT:
 * The API currently returns the Ozow payment URL
 * using the property name `gatewayUrl`.
 */
interface OzowResponse {
    gatewayUrl?: string;
    paymentRequestId?: string;
    error?: string | null;
    message?: string;
}

export default function CheckoutPage() {
    const { checkoutOrder } = useCart();

    const [cartData, setCartData] = useState<CartItem[]>([]);

    const idempotencyKeyRef = useRef<string | null>(null);

    const [shippingOption, setShippingOption] =
        useState<ShippingOption | null>(null);

    const [subtotal, setSubtotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [totalToPay, setTotalToPay] = useState(0);

    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Locker delivery
    const [lockerName, setLockerName] = useState('');

    // Door-to-door delivery
    const [street, setStreet] = useState('');
    const [suburb, setSuburb] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');

    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    /*
     * ---------------------------------------------------------
     * LOAD CART / SHIPPING DATA
     * ---------------------------------------------------------
     */
    useEffect(() => {
        const storedShipping = localStorage.getItem(
            'glowavee_selected_shipping'
        );

        const storedSummary = localStorage.getItem(
            'glowavee_cart_summary'
        );

        if (storedShipping) {
            try {
                const parsedShipping =
                    JSON.parse(storedShipping);

                setShippingOption(parsedShipping);
            } catch (error) {
                console.error(
                    'Failed to parse shipping option:',
                    error
                );
            }
        }

        if (storedSummary) {
            try {
                const parsedSummary =
                    JSON.parse(storedSummary);

                setCartData(parsedSummary.items || []);

                setSubtotal(
                    Number(parsedSummary.subtotal) || 0
                );

                setShippingFee(
                    Number(parsedSummary.shippingFee) || 0
                );

                setTotalToPay(
                    Number(parsedSummary.totalToPay) || 0
                );
            } catch (error) {
                console.error(
                    'Failed to parse cart summary:',
                    error
                );
            }
        }
    }, []);

    const isLocker =
        shippingOption?.id === 'tcg-locker';

    /*
     * ---------------------------------------------------------
     * FORM VALIDATION
     * ---------------------------------------------------------
     */
    const validateForm = () => {
        if (!customerName.trim()) {
            setErrorMessage(
                'Please enter your full name.'
            );

            return false;
        }

        if (!phoneNumber.trim()) {
            setErrorMessage(
                'Please enter your WhatsApp number.'
            );

            return false;
        }

        if (isLocker) {
            if (!lockerName.trim()) {
                setErrorMessage(
                    'Please enter your PUDO locker name or location.'
                );

                return false;
            }
        } else {
            if (!street.trim()) {
                setErrorMessage(
                    'Please enter your street address.'
                );

                return false;
            }

            if (!suburb.trim()) {
                setErrorMessage(
                    'Please enter your suburb.'
                );

                return false;
            }

            if (!city.trim()) {
                setErrorMessage(
                    'Please enter your city or town.'
                );

                return false;
            }

            if (!postalCode.trim()) {
                setErrorMessage(
                    'Please enter your postal code.'
                );

                return false;
            }
        }

        if (!totalToPay || totalToPay <= 0) {
            setErrorMessage(
                'There is a problem with your order total. Please return to your cart.'
            );

            return false;
        }

        if (!cartData.length) {
            setErrorMessage(
                'Your cart is empty. Please return to your cart.'
            );

            return false;
        }

        setErrorMessage('');

        return true;
    };

    /*
     * ---------------------------------------------------------
     * SUBMIT CHECKOUT
     * ---------------------------------------------------------
     */
    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        /*
         * Build the final delivery address.
         */
        let finalDeliveryString = '';

        if (isLocker) {
            finalDeliveryString =
                `PUDO Locker: ${lockerName.trim()}`;
        } else {
            finalDeliveryString =
                `${street.trim()}, ${suburb.trim()}, ${city.trim()}, ${postalCode.trim()}`;
        }

        setLoading(true);
        setErrorMessage('');
        setCompleted(false);

        /*
         * Generate a unique transaction reference.
         */
        const checkoutFingerprint = JSON.stringify({
            customerName: customerName.trim(),
            phoneNumber: phoneNumber.trim(),
            deliveryAddress: finalDeliveryString,
            shippingMethod:
                shippingOption?.name || 'Standard Delivery',
            shippingFee: Number(shippingFee.toFixed(2)),
            items: [...cartData]
                .map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                }))
                .sort((a, b) =>
                    String(a.id).localeCompare(String(b.id)),
                ),
        });

        const storageKey = 'glowavee_checkout_attempt';
        let idempotencyKey: string;

        try {
            const saved = sessionStorage.getItem(storageKey);
            const previous = saved ? JSON.parse(saved) : null;

            if (
                previous?.fingerprint === checkoutFingerprint &&
                typeof previous?.key === 'string'
            ) {
                idempotencyKey = previous.key;
            } else {
                idempotencyKey = crypto.randomUUID();

                sessionStorage.setItem(
                    storageKey,
                    JSON.stringify({
                        fingerprint: checkoutFingerprint,
                        key: idempotencyKey,
                    }),
                );
            }

            idempotencyKeyRef.current = idempotencyKey;
        } catch {
            setErrorMessage(
                'Unable to prepare a secure checkout attempt. Please refresh and try again.',
            );
            setLoading(false);
            return;
        }

        const transactionReference = `GV-${Date.now()}`;

        /*
         * ---------------------------------------------------------
         * PREPARE LOCAL ORDER
         * ---------------------------------------------------------
         *
         * IMPORTANT:
         *
         * This does NOT mean the payment was successful.
         *
         * Payment confirmation must come from Ozow's
         * payment notification/status flow.
         */
        try {
            checkoutOrder(
                customerName.trim(),
                finalDeliveryString,
                phoneNumber.trim(),
                {
                    method:
                        shippingOption?.name ||
                        'Standard Delivery',

                    fee: shippingFee,

                    total: totalToPay,

                    items: cartData,
                }
            );
        } catch (error) {
            console.error(
                'Failed to prepare checkout order:',
                error
            );

            setErrorMessage(
                'We could not prepare your order. Please try again.'
            );

            setLoading(false);

            return;
        }

        /*
         * ---------------------------------------------------------
         * INITIALISE OZOW PAYMENT
         * ---------------------------------------------------------
         *
         * Browser
         *    ↓
         * /api/checkout/ozow
         *    ↓
         * Ozow PostPaymentRequest API
         *    ↓
         * gatewayUrl
         *    ↓
         * Ozow Secure payment page
         *
         * The browser NEVER sends the private key.
         */
        try {
            const response = await fetch(
                '/api/checkout/ozow',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',
                    },

                    body: JSON.stringify({
                        amount: Number(
                            totalToPay.toFixed(2)
                        ),

                        transactionReference,
                        idempotencyKey,

                        customerName:
                            customerName.trim(),

                        phoneNumber:
                            phoneNumber.trim(),

                        deliveryAddress:
                            finalDeliveryString,

                        shippingMethod:
                            shippingOption?.name ||
                            'Standard Delivery',

                        shippingFee: Number(
                            shippingFee.toFixed(2)
                        ),

                        items: cartData,
                    }),
                }
            );

            /*
             * Parse backend response.
             */
            let data: OzowResponse;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    'The payment server returned an invalid response.'
                );
            }

            /*
             * Safe logging.
             *
             * We intentionally do not log secrets or
             * payment hashes.
             */
            console.log(
                'Ozow API response:',
                {
                    status: response.status,

                    ok: response.ok,

                    paymentRequestId:
                        data.paymentRequestId,

                    gatewayUrl:
                        data.gatewayUrl,

                    error: data.error,

                    message: data.message,
                }
            );

            /*
             * Check HTTP response.
             */
            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        'Unable to initialise Ozow payment.'
                );
            }

            /*
             * Check application-level error.
             */
            if (data.error) {
                throw new Error(data.error);
            }

            /*
             * -----------------------------------------------------
             * VERIFY GATEWAY URL
             * -----------------------------------------------------
             *
             * Your route.ts currently returns:
             *
             * gatewayUrl:
             * https://pay.ozow.com/<payment-request-id>/Secure
             *
             * We MUST use this URL.
             *
             * We do NOT navigate to:
             *
             * https://pay.ozow.com/
             */
            if (!data.gatewayUrl) {
                console.error(
                    'Ozow payment URL missing:',
                    data
                );

                throw new Error(
                    'Ozow did not return a payment URL.'
                );
            }

            const gatewayUrl =
                data.gatewayUrl;

            /*
             * Parse the URL before redirecting.
             */
            let parsedGatewayUrl: URL;

            try {
                parsedGatewayUrl =
                    new URL(gatewayUrl);
            } catch {
                console.error(
                    'Invalid Ozow gateway URL:',
                    gatewayUrl
                );

                throw new Error(
                    'Ozow returned an invalid payment URL.'
                );
            }

            /*
             * Security check.
             *
             * Only allow HTTPS requests to the
             * official Ozow payment host.
             */
            if (
                parsedGatewayUrl.protocol !==
                    'https:' ||
                parsedGatewayUrl.hostname !==
                    'pay.ozow.com'
            ) {
                console.error(
                    'Unexpected Ozow payment URL:',
                    gatewayUrl
                );

                throw new Error(
                    'Ozow returned an unexpected payment URL.'
                );
            }

            /*
             * -----------------------------------------------------
             * LOG PAYMENT REQUEST
             * -----------------------------------------------------
             */
            console.log(
                'Ozow payment request created:',
                {
                    paymentRequestId:
                        data.paymentRequestId,

                    gatewayUrl,
                }
            );

            /*
             * -----------------------------------------------------
             * REDIRECT TO OZOW
             * -----------------------------------------------------
             *
             * IMPORTANT:
             *
             * We are now redirecting to the UNIQUE URL
             * generated by Ozow's PostPaymentRequest API.
             *
             * Example:
             *
             * https://pay.ozow.com/
             * eeedd690-aa9d-4c95-9d5c-e8530149a334/
             * Secure
             *
             * We are NOT POSTing a form to:
             *
             * https://pay.ozow.com/
             *
             * This is the critical difference from the
             * previous integration.
             */
            window.location.assign(
                gatewayUrl
            );

            /*
             * Do not mark the order as completed here.
             *
             * Payment has not been confirmed yet.
             */
        } catch (error) {
            console.error(
                'Ozow checkout error:',
                error
            );

            const message =
                error instanceof Error
                    ? error.message
                    : 'Unable to connect to Ozow. Please try again.';

            setErrorMessage(message);

            setLoading(false);

            setCompleted(false);
        }
    };

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */
    return (
        <div className="w-full min-h-screen bg-(--color-background) pb-16 box-border">
            <main className="flex flex-col gap-6 px-6 pt-6 max-w-full mx-auto w-full box-border">

                {/* Heading */}
                <div className="flex flex-col gap-1 items-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark) flex items-center gap-1.5">
                        <Lock size={12} />
                        Secure Checkout
                    </span>

                    <h1 className="text-2xl font-serif text-(--color-text)">
                        Delivery Details
                    </h1>
                </div>

                {/* Error */}
                {errorMessage && (
                    <div className="w-full border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                {/* Empty cart */}
                {cartData.length === 0 &&
                !completed ? (
                    <div className="w-full border border-(--color-border-strong) p-10 text-center shadow-xs flex flex-col items-center justify-center">

                        <div className="w-16 h-16 bg-(--color-surface) flex items-center justify-center text-(--color-gold-dark) mb-4 border border-(--color-border)">
                            <Sparkles size={28} />
                        </div>

                        <h2 className="text-lg font-serif text-(--color-text) mb-1">
                            Your bag is currently empty
                        </h2>

                        <p className="text-xs text-(--color-text-muted) max-w-xs mb-6">
                            Explore our luxury collagen and
                            skincare collection to find your
                            ideal glow.
                        </p>

                        <Link
                            href="/cart"
                            className="w-full h-12 inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3d2c10]/15 transition-all hover:brightness-105"
                        >
                            Return to Cart

                            <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : completed &&
                  !loading ? (
                    /* Success state */
                    <div className="w-full border border-(--color-border-strong) p-10 text-center shadow-xs flex flex-col items-center justify-center space-y-6">

                        <div className="w-16 h-16 bg-(--color-surface) flex items-center justify-center text-(--color-gold-dark) rounded-full border border-(--color-border) shadow-inner">
                            <CheckCircle2 size={32} />
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-xl font-serif text-(--color-text)">
                                Order Successfully Confirmed
                            </h2>

                            <p className="text-xs text-(--color-text-muted) max-w-sm mx-auto">
                                Your skincare curation has
                                been secured via{' '}
                                {shippingOption?.name}.
                            </p>
                        </div>

                        <div className="w-full pt-6 border-t border-(--color-border) space-y-3">

                            <div className="space-y-1">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text)">
                                    Access Your Client Portal
                                </h3>

                                <p className="text-[11px] text-(--color-text-muted)">
                                    Sign in to track real-time
                                    shipping status or create
                                    your account below.
                                </p>
                            </div>

                            <div className="flex flex-row pt-2 w-full">

                                <Link
                                    href="/signin"
                                    className="flex-1 h-11 inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3d2c10]/15 transition-all hover:brightness-105"
                                >
                                    <LogIn size={14} />
                                    Sign In
                                </Link>

                                <Link
                                    href="/signup"
                                    className="flex-1 h-11 inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3d2c10]/15 transition-all hover:brightness-105"
                                >
                                    Create Account
                                    <UserPlus size={14} />
                                </Link>

                            </div>
                        </div>
                    </div>
                ) : (
                    /* Checkout form */
                    <div className="w-full border border-(--color-border-strong) p-6 shadow-xs">

                        {/* Shipping header */}
                        <div className="mb-5 flex items-center justify-between border-b border-(--color-border) pb-4">

                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark) mb-0.5">
                                    Shipping Information *
                                </p>

                                <p className="text-xs text-(--color-text-muted)">
                                    Method:{' '}

                                    <span className="font-bold text-(--color-text)">
                                        {shippingOption
                                            ? shippingOption.name
                                            : 'Standard Delivery'}
                                    </span>
                                </p>
                            </div>

                            <Link
                                href="/cart"
                                className="text-[11px] font-bold text-(--color-gold-dark) uppercase tracking-wider hover:underline"
                            >
                                Change
                            </Link>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >

                            {/* Full name */}
                            <div className="space-y-1">

                                <label className="text-[10px] font-bold uppercase tracking-wider text-(--color-text)">
                                    Full Name *
                                </label>

                                <input
                                    value={
                                        customerName
                                    }
                                    onChange={(e) =>
                                        setCustomerName(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10]"
                                    placeholder="Enter your full name"
                                    required
                                    disabled={loading}
                                />

                            </div>

                            {/* Phone */}
                            <div className="space-y-1">

                                <label className="text-[10px] font-bold uppercase tracking-wider text-(--color-text)">
                                    WhatsApp Number *
                                </label>

                                <input
                                    type="tel"
                                    value={
                                        phoneNumber
                                    }
                                    onChange={(e) =>
                                        setPhoneNumber(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10]"
                                    placeholder="e.g. 082 123 4567"
                                    required
                                    disabled={loading}
                                />

                            </div>

                            {/* Locker */}
                            {isLocker ? (
                                <div className="space-y-1">

                                    <div className="flex items-center justify-between">

                                        <label className="text-[10px] font-bold uppercase tracking-wider text-(--color-text) flex items-center gap-1.5">

                                            <MapPin
                                                size={12}
                                                className="text-(--color-gold-dark)"
                                            />

                                            PUDO Locker Name /
                                            Location *

                                        </label>

                                        <a
                                            href="https://www.thecourierguy.co.za/pudo"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-medium text-(--color-gold-dark) hover:underline"
                                        >
                                            Find Locker ↗
                                        </a>

                                    </div>

                                    <input
                                        type="text"
                                        value={
                                            lockerName
                                        }
                                        onChange={(e) =>
                                            setLockerName(
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10]"
                                        placeholder="e.g. Engen 1-Stop Carousel"
                                        required
                                        disabled={loading}
                                    />

                                    <p className="text-[10px] text-(--color-text-muted)">
                                        Please enter the name or
                                        terminal ID of your chosen
                                        PUDO locker location.
                                    </p>

                                </div>
                            ) : (
                                /* Door-to-door */
                                <div className="space-y-3 pt-1">

                                    <label className="text-[10px] font-bold uppercase tracking-wider text-(--color-text) flex items-center gap-1.5">

                                        <Home
                                            size={12}
                                            className="text-(--color-gold-dark)"
                                        />

                                        Delivery Address Details *

                                    </label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                        <input
                                            type="text"
                                            value={street}
                                            onChange={(e) =>
                                                setStreet(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10]"
                                            placeholder="Street Address (e.g. 15 Rose Ave) *"
                                            required
                                            disabled={loading}
                                        />

                                        <input
                                            type="text"
                                            value={suburb}
                                            onChange={(e) =>
                                                setSuburb(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10]"
                                            placeholder="Suburb / District *"
                                            required
                                            disabled={loading}
                                        />

                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) =>
                                                setCity(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10]"
                                            placeholder="City / Town *"
                                            required
                                            disabled={loading}
                                        />

                                        <input
                                            type="text"
                                            value={
                                                postalCode
                                            }
                                            onChange={(e) =>
                                                setPostalCode(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-(--color-border) px-4 py-3 text-xs sm:text-sm outline-none transition focus:border-[#3d2c10]"
                                            placeholder="Postal Code *"
                                            required
                                            disabled={loading}
                                        />

                                    </div>

                                </div>
                            )}


                            {/* Explicit spacing */}
                            <div className="h-10" />

                            {/* Pay button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 mt-2 inline-flex items-center justify-center gap-3 bg-linear-to-r from-[#3d2c10] to-[#f3c54b] text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#3d2c10]/10 transition hover:brightness-105 disabled:opacity-70"
                            >
                                {loading ? (
                                    'Connecting to Ozow...'
                                ) : (
                                    <>
                                        <span>Pay with</span>

                                        <Image
                                            src="/ozow.png"
                                            alt="Pay with Ozow"
                                            className="h-5 w-auto object-contain"
                                            width={100}
                                            height={40}
                                        />

                                        <span>• R{totalToPay.toFixed(2)}</span>

                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            {/* Back to cart */}
                            <div className="pt-2 text-center">

                                <Link
                                    href="/cart"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--color-text-muted) transition-colors hover:text-(--color-gold-dark)"
                                >
                                    <ArrowLeft size={14} />
                                    Back to Cart
                                </Link>

                            </div>

                        </form>

                        {/* Security message */}
                        <div className="flex items-center justify-center gap-1.5 mt-6 pt-6 border-t border-(--color-border) text-[10px] text-(--color-text-muted)">

                            <ShieldCheck
                                size={14}
                                className="text-(--color-gold-dark)"
                            />

                            <span>
                                Encrypted & secure checkout
                                processing
                            </span>

                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}