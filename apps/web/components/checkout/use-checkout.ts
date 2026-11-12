'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { useCart } from '@/context/cart-context';

import { TENANT_CODE } from './constants';

import type {
    CartItem,
    CustomerProfile,
    OzowResponse,
    ShippingOption,
} from './types';

export function useCheckout() {
    const { checkoutOrder } = useCart();

    const [cartData, setCartData] = useState<CartItem[]>([]);
    const [shippingOption, setShippingOption] =
        useState<ShippingOption | null>(null);

    const [subtotal, setSubtotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [totalToPay, setTotalToPay] = useState(0);

    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [lockerName, setLockerName] = useState('');

    const [street, setStreet] = useState('');
    const [suburb, setSuburb] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');

    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [customerAuthenticated, setCustomerAuthenticated] =
        useState(false);

    const idempotencyKeyRef = useRef<string | null>(null);

    const isLocker = shippingOption?.id === 'tcg-locker';

    useEffect(() => {
        const storedShipping = localStorage.getItem(
            'glowavee_selected_shipping',
        );

        const storedSummary = localStorage.getItem(
            'glowavee_cart_summary',
        );

        if (storedShipping) {
            try {
                setShippingOption(JSON.parse(storedShipping));
            } catch (error) {
                console.error(
                    'Failed to parse shipping option:',
                    error,
                );
            }
        }

        if (storedSummary) {
            try {
                const parsedSummary = JSON.parse(storedSummary);

                setCartData(parsedSummary.items || []);
                setSubtotal(Number(parsedSummary.subtotal) || 0);
                setShippingFee(Number(parsedSummary.shippingFee) || 0);
                setTotalToPay(Number(parsedSummary.totalToPay) || 0);
            } catch (error) {
                console.error(
                    'Failed to parse cart summary:',
                    error,
                );
            }
        }
    }, []);

    useEffect(() => {
        const loadCustomerProfile = async () => {
            const token = localStorage.getItem(
                'customer_auth_token',
            );

            setCustomerAuthenticated(Boolean(token));

            if (!token) {
                setProfileLoaded(true);
                return;
            }

            const authBaseUrl = (
                process.env.NEXT_PUBLIC_CUSTOMER_AUTH_URL ||
                'http://localhost:4001'
            ).replace(/\/+$/, '');

            try {
                const response = await fetch(
                    `${authBaseUrl}/customer/profile?tenantCode=${TENANT_CODE}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        'Unable to load customer profile.',
                    );
                }

                const result = await response.json();

                const profile: CustomerProfile =
                    result.profile ||
                    result.data ||
                    result;

                if (profile.name) {
                    setCustomerName((current) =>
                        current || profile.name || '',
                    );
                }

                if (profile.phone) {
                    setPhoneNumber((current) =>
                        current || profile.phone || '',
                    );
                }

                const address = profile.address;

                if (address && typeof address === 'object') {
                    setStreet(
                        address.street ||
                        address.streetAddress ||
                        address.addressLine1 ||
                        '',
                    );

                    setSuburb(
                        address.suburb ||
                        address.district ||
                        '',
                    );

                    setCity(
                        address.city ||
                        address.town ||
                        '',
                    );

                    setPostalCode(
                        address.postalCode ||
                        address.postcode ||
                        '',
                    );
                } else if (
                    typeof address === 'string' &&
                    address.trim()
                ) {
                    const parts = address
                        .split(',')
                        .map((part) => part.trim());

                    setStreet(parts[0] || '');
                    setSuburb(parts[1] || '');
                    setCity(parts[2] || '');
                    setPostalCode(parts[3] || '');
                }
            } catch (error) {
                console.error(
                    'Failed to load customer profile:',
                    error,
                );
            } finally {
                setProfileLoaded(true);
            }
        };

        loadCustomerProfile();
    }, []);

    const validateForm = () => {
        if (!customerName.trim()) {
            setErrorMessage('Please enter your full name.');
            return false;
        }

        if (!phoneNumber.trim()) {
            setErrorMessage('Please enter your WhatsApp number.');
            return false;
        }

        if (isLocker) {
            if (!lockerName.trim()) {
                setErrorMessage(
                    'Please enter your PUDO locker name or location.',
                );
                return false;
            }
        } else {
            if (!street.trim()) {
                setErrorMessage('Please enter your street address.');
                return false;
            }

            if (!suburb.trim()) {
                setErrorMessage('Please enter your suburb.');
                return false;
            }

            if (!city.trim()) {
                setErrorMessage('Please enter your city or town.');
                return false;
            }

            if (!postalCode.trim()) {
                setErrorMessage('Please enter your postal code.');
                return false;
            }
        }

        if (!totalToPay || totalToPay <= 0) {
            setErrorMessage(
                'There is a problem with your order total. Please return to your cart.',
            );
            return false;
        }

        if (!cartData.length) {
            setErrorMessage(
                'Your cart is empty. Please return to your cart.',
            );
            return false;
        }

        setErrorMessage('');
        return true;
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        const finalDeliveryString = isLocker
            ? `PUDO Locker: ${lockerName.trim()}`
            : `${street.trim()}, ${suburb.trim()}, ${city.trim()}, ${postalCode.trim()}`;

        setLoading(true);
        setErrorMessage('');
        setCompleted(false);

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
                },
            );
        } catch (error) {
            console.error(
                'Failed to prepare checkout order:',
                error,
            );

            setErrorMessage(
                'We could not prepare your order. Please try again.',
            );

            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/checkout/ozow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Number(totalToPay.toFixed(2)),
                    transactionReference,
                    idempotencyKey,
                    customerName: customerName.trim(),
                    phoneNumber: phoneNumber.trim(),
                    deliveryAddress: finalDeliveryString,
                    shippingMethod:
                        shippingOption?.name ||
                        'Standard Delivery',
                    shippingFee: Number(shippingFee.toFixed(2)),
                    items: cartData,
                }),
            });

            let data: OzowResponse;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    'The payment server returned an invalid response.',
                );
            }

            console.log('Ozow API response:', {
                status: response.status,
                ok: response.ok,
                paymentRequestId: data.paymentRequestId,
                gatewayUrl: data.gatewayUrl,
                error: data.error,
                message: data.message,
            });

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    'Unable to initialise Ozow payment.',
                );
            }

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.gatewayUrl) {
                console.error(
                    'Ozow payment URL missing:',
                    data,
                );

                throw new Error(
                    'Ozow did not return a payment URL.',
                );
            }

            let parsedGatewayUrl: URL;

            try {
                parsedGatewayUrl = new URL(data.gatewayUrl);
            } catch {
                console.error(
                    'Invalid Ozow gateway URL:',
                    data.gatewayUrl,
                );

                throw new Error(
                    'Ozow returned an invalid payment URL.',
                );
            }

            if (
                parsedGatewayUrl.protocol !== 'https:' ||
                parsedGatewayUrl.hostname !== 'pay.ozow.com'
            ) {
                console.error(
                    'Unexpected Ozow payment URL:',
                    data.gatewayUrl,
                );

                throw new Error(
                    'Ozow returned an unexpected payment URL.',
                );
            }

            console.log(
                'Ozow payment request created:',
                {
                    paymentRequestId: data.paymentRequestId,
                    gatewayUrl: data.gatewayUrl,
                },
            );

            window.location.assign(data.gatewayUrl);
        } catch (error) {
            console.error('Ozow checkout error:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Unable to connect to Ozow. Please try again.';

            setErrorMessage(message);
            setLoading(false);
            setCompleted(false);
        }
    };

    return {
        cartData,
        shippingOption,
        subtotal,
        shippingFee,
        totalToPay,
        customerName,
        setCustomerName,
        phoneNumber,
        setPhoneNumber,
        lockerName,
        setLockerName,
        street,
        setStreet,
        suburb,
        setSuburb,
        city,
        setCity,
        postalCode,
        setPostalCode,
        isLocker,
        completed,
        loading,
        errorMessage,
        profileLoaded,
        customerAuthenticated,
        handleSubmit,
    };
}
