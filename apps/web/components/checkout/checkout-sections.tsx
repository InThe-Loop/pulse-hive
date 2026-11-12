'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Home,
    Lock,
    LogIn,
    MapPin,
    Package,
    ShieldCheck,
    Sparkles,
    Truck,
    UserPlus,
    UserRound,
} from 'lucide-react';

import {
    formatPrice,
    inputClassName,
    sectionClassName,
} from './constants';

import type {
    CartItem,
    ShippingOption,
} from './types';

export function CheckoutHeader() {
    return (
        <div className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-8 sm:px-10 sm:py-9">
            <div className="absolute inset-x-0 top-0 h-px gold-foil" />

            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />

            <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

            <div className="relative z-10">
                <span className="flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                    Secure Checkout
                </span>

                <h1 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl">
                    Complete Your Order
                </h1>

                <p className="mt-3 max-w-xl font-body text-xs leading-6 text-white/60 sm:text-sm">
                    A few final details and your carefully selected
                    products will be ready for secure payment.
                </p>
            </div>
        </div>
    );
}

export function CheckoutError({
    message,
}: {
    message: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <div className="mb-6 flex items-start gap-3 border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0"
            />

            <span>{message}</span>
        </div>
    );
}

export function CheckoutEmptyState() {
    return (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border border-(--color-border-strong) bg-(--color-surface) px-6 py-12 text-center shadow-xs sm:px-10">
            <div className="absolute inset-x-0 top-0 h-px gold-foil" />

            <div className="mb-5 flex h-16 w-16 items-center justify-center border border-(--color-border) bg-(--color-background) text-(--color-gold-dark)">
                <Sparkles size={26} />
            </div>

            <h2 className="mb-2 font-serif text-xl text-(--color-text)">
                Your bag is currently empty
            </h2>

            <p className="mb-7 max-w-sm text-xs leading-6 text-(--color-text-muted)">
                Explore our luxury collagen and skincare collection
                to find your ideal glow.
            </p>

            <Link
                href="/cart"
                className="button-gold inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 px-6 text-xs font-bold uppercase tracking-wider transition-all hover:brightness-105"
            >
                Return to Cart
                <ArrowRight size={14} />
            </Link>
        </div>
    );
}

export function CheckoutSuccessState({
    shippingOption,
}: {
    shippingOption: ShippingOption | null;
}) {
    return (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border border-(--color-border-strong) bg-(--color-surface) px-6 py-10 text-center shadow-xs sm:px-10">
            <div className="absolute inset-x-0 top-0 h-px gold-foil" />

            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-(--color-border) bg-(--color-background) text-(--color-gold-dark) shadow-inner">
                <CheckCircle2 size={30} />
            </div>

            <div className="mt-6 space-y-2">
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                    Glowa Vee
                </span>

                <h2 className="font-serif text-xl text-(--color-text) sm:text-2xl">
                    Order Successfully Confirmed
                </h2>

                <p className="mx-auto max-w-sm text-xs leading-6 text-(--color-text-muted)">
                    Your skincare curation has been secured via{' '}
                    {shippingOption?.name}.
                </p>
            </div>

            <div className="mt-8 w-full max-w-lg border-t border-(--color-border) pt-6">
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-(--color-text)">
                        Access Your Client Portal
                    </h3>

                    <p className="text-[11px] leading-5 text-(--color-text-muted)">
                        Sign in to track real-time shipping status or
                        create your account below.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3 pt-5 sm:flex-row">
                    <Link
                        href="/signin"
                        className="button-gold inline-flex h-11 flex-1 items-center justify-center gap-2 px-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:brightness-105"
                    >
                        <LogIn size={14} />
                        Sign In
                    </Link>

                    <Link
                        href="/signup"
                        className="button-gold inline-flex h-11 flex-1 items-center justify-center gap-2 px-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:brightness-105"
                    >
                        Create Account
                        <UserPlus size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

type CustomerDetailsProps = {
    customerName: string;
    phoneNumber: string;
    profileLoaded: boolean;
    customerAuthenticated: boolean;
    loading: boolean;
    onCustomerNameChange: (value: string) => void;
    onPhoneNumberChange: (value: string) => void;
};

export function CustomerDetails({
    customerName,
    phoneNumber,
    profileLoaded,
    customerAuthenticated,
    loading,
    onCustomerNameChange,
    onPhoneNumberChange,
}: CustomerDetailsProps) {
    return (
        <section className={sectionClassName}>
            <div className="absolute inset-x-0 top-0 h-px gold-foil" />

            <div className="mb-6 flex items-center gap-3 border-b border-(--color-border) pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-(--color-border) bg-(--color-background) text-(--color-gold-dark)">
                    <UserRound size={18} />
                </div>

                <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                        Step 01
                    </span>

                    <h2 className="mt-1 font-serif text-lg text-(--color-text)">
                        Your Details
                    </h2>

                    <p className="mt-1 text-[11px] text-(--color-text-muted)">
                        Who should we prepare this order for?
                    </p>
                </div>

                {profileLoaded && customerAuthenticated && (
                    <div className="ml-auto">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-(--color-gold-dark)">
                            <ShieldCheck size={12} />
                            Client
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-5">
                <div className="space-y-2">
                    <label
                        htmlFor="checkout-customer-name"
                        className="text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-text)"
                    >
                        Full Name *
                    </label>

                    <input
                        id="checkout-customer-name"
                        value={customerName}
                        onChange={(event) =>
                            onCustomerNameChange(event.target.value)
                        }
                        className={inputClassName}
                        placeholder="Enter your full name"
                        required
                        disabled={loading}
                        autoComplete="name"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="checkout-phone-number"
                        className="text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-text)"
                    >
                        WhatsApp Number *
                    </label>

                    <input
                        id="checkout-phone-number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(event) =>
                            onPhoneNumberChange(event.target.value)
                        }
                        className={inputClassName}
                        placeholder="e.g. 082 123 4567"
                        required
                        disabled={loading}
                        autoComplete="tel"
                    />

                    <p className="text-[10px] leading-5 text-(--color-text-muted)">
                        We'll use this number for delivery-related
                        communication.
                    </p>
                </div>

                {profileLoaded && (
                    <p className="flex items-center gap-2 border-t border-(--color-border) pt-4 text-[10px] leading-5 text-(--color-text-muted)">
                        <ShieldCheck
                            size={13}
                            className="shrink-0 text-(--color-gold-dark)"
                        />
                        Your details are used to prepare and deliver
                        your order.
                    </p>
                )}
            </div>
        </section>
    );
}

type DeliveryDetailsProps = {
    shippingOption: ShippingOption | null;
    isLocker: boolean;
    lockerName: string;
    street: string;
    suburb: string;
    city: string;
    postalCode: string;
    loading: boolean;
    onLockerNameChange: (value: string) => void;
    onStreetChange: (value: string) => void;
    onSuburbChange: (value: string) => void;
    onCityChange: (value: string) => void;
    onPostalCodeChange: (value: string) => void;
};

export function DeliveryDetails({
    shippingOption,
    isLocker,
    lockerName,
    street,
    suburb,
    city,
    postalCode,
    loading,
    onLockerNameChange,
    onStreetChange,
    onSuburbChange,
    onCityChange,
    onPostalCodeChange,
}: DeliveryDetailsProps) {
    return (
        <section className={sectionClassName}>
            <div className="absolute inset-x-0 top-0 h-px gold-foil" />

            <div className="mb-6 flex items-center gap-3 border-b border-(--color-border) pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-(--color-border) bg-(--color-background) text-(--color-gold-dark)">
                    <Truck size={18} />
                </div>

                <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                        Step 02
                    </span>

                    <h2 className="mt-1 font-serif text-lg text-(--color-text)">
                        Delivery Details
                    </h2>

                    <p className="mt-1 text-[11px] text-(--color-text-muted)">
                        Where would you like your order delivered?
                    </p>
                </div>

                <Link
                    href="/cart"
                    className="ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-(--color-gold-dark) transition-colors hover:text-(--color-gold-light)"
                >
                    Change
                    <ArrowRight size={12} />
                </Link>
            </div>

            <div className="mb-5 border border-(--color-border) bg-(--color-background) px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-text-muted)">
                    Selected delivery method
                </p>

                <p className="mt-1 text-sm font-semibold text-(--color-text)">
                    {shippingOption?.name || 'Standard Delivery'}
                </p>
            </div>

            {isLocker ? (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                            htmlFor="checkout-locker"
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-text)"
                        >
                            <MapPin
                                size={13}
                                className="text-(--color-gold-dark)"
                            />
                            PUDO Locker *
                        </label>

                        <a
                            href="https://www.thecourierguy.co.za/pudo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-medium text-(--color-gold-dark) transition-colors hover:text-(--color-gold-light) hover:underline"
                        >
                            Find a Locker ↗
                        </a>
                    </div>

                    <input
                        id="checkout-locker"
                        type="text"
                        value={lockerName}
                        onChange={(event) =>
                            onLockerNameChange(event.target.value)
                        }
                        className={inputClassName}
                        placeholder="e.g. Engen 1-Stop Carousel"
                        required
                        disabled={loading}
                    />

                    <p className="text-[10px] leading-5 text-(--color-text-muted)">
                        Please enter the name or terminal ID of your
                        chosen PUDO locker location.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-text)">
                        <Home
                            size={13}
                            className="text-(--color-gold-dark)"
                        />
                        Delivery Address *
                    </label>

                    <div className="space-y-3">
                        <input
                            type="text"
                            value={street}
                            onChange={(event) =>
                                onStreetChange(event.target.value)
                            }
                            className={inputClassName}
                            placeholder="Street Address (e.g. 15 Rose Ave) *"
                            required
                            disabled={loading}
                            autoComplete="street-address"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input
                                type="text"
                                value={suburb}
                                onChange={(event) =>
                                    onSuburbChange(event.target.value)
                                }
                                className={inputClassName}
                                placeholder="Suburb / District *"
                                required
                                disabled={loading}
                                autoComplete="address-level3"
                            />

                            <input
                                type="text"
                                value={city}
                                onChange={(event) =>
                                    onCityChange(event.target.value)
                                }
                                className={inputClassName}
                                placeholder="City / Town *"
                                required
                                disabled={loading}
                                autoComplete="address-level2"
                            />
                        </div>

                        <input
                            type="text"
                            value={postalCode}
                            onChange={(event) =>
                                onPostalCodeChange(event.target.value)
                            }
                            className={inputClassName}
                            placeholder="Postal Code *"
                            required
                            disabled={loading}
                            autoComplete="postal-code"
                        />
                    </div>

                    <p className="text-[10px] leading-5 text-(--color-text-muted)">
                        Please ensure your delivery address is accurate
                        so your order reaches you without delay.
                    </p>
                </div>
            )}
        </section>
    );
}

type OrderSummaryProps = {
    cartData: CartItem[];
    subtotal: number;
    shippingFee: number;
    totalToPay: number;
    loading: boolean;
};

export function OrderSummary({
    cartData,
    subtotal,
    shippingFee,
    totalToPay,
    loading,
}: OrderSummaryProps) {
    const itemCount = cartData.reduce(
        (count, item) => count + Number(item.quantity || 1),
        0,
    );

    return (
        <aside className="min-w-0 lg:sticky lg:top-28">
            <section className={sectionClassName}>
                <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                <div className="mb-6 flex items-center gap-3 border-b border-(--color-border) pb-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-(--color-border) bg-(--color-background) text-(--color-gold-dark)">
                        <Package size={18} />
                    </div>

                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                            Your Selection
                        </span>

                        <h2 className="mt-1 font-serif text-lg text-(--color-text)">
                            Order Summary
                        </h2>
                    </div>

                    <span className="ml-auto border border-(--color-border) px-2.5 py-1 text-[10px] font-semibold text-(--color-text-muted)">
                        {itemCount} items
                    </span>
                </div>

                <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
                    {cartData.map((item, index) => {
                        const quantity = Number(item.quantity || 1);
                        const price = Number(item.price || 0);

                        const imageSrc =
                            item.image ||
                            item.imageUrl ||
                            item.productImage ||
                            item.thumbnail;

                        return (
                            <div
                                key={
                                    item.id ||
                                    `${item.name || 'item'}-${index}`
                                }
                                className="flex gap-3"
                            >
                                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-(--color-border) bg-(--color-background)">
                                    {imageSrc ? (
                                        <Image
                                            src={imageSrc}
                                            alt={
                                                item.name ||
                                                'Glowa Vee product'
                                            }
                                            width={64}
                                            height={64}
                                            unoptimized
                                            className="h-full w-full object-contain p-1"
                                        />
                                    ) : (
                                        <Package
                                            size={21}
                                            className="text-(--color-gold-dark)"
                                        />
                                    )}
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col justify-center">
                                    <p className="line-clamp-2 text-xs font-semibold leading-5 text-(--color-text)">
                                        {item.name || 'Glowa Vee Product'}
                                    </p>

                                    <p className="mt-1 text-[10px] text-(--color-text-muted)">
                                        Qty: {quantity}
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center">
                                    <span className="text-xs font-semibold tabular-nums text-(--color-text)">
                                        {formatPrice(price * quantity)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 space-y-3 border-t border-(--color-border) pt-5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-(--color-text-muted)">
                            Subtotal
                        </span>

                        <span className="font-medium tabular-nums text-(--color-text)">
                            {formatPrice(subtotal)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-(--color-text-muted)">
                            Delivery
                        </span>

                        <span className="font-medium tabular-nums text-(--color-text)">
                            {shippingFee > 0
                                ? formatPrice(shippingFee)
                                : 'Included'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-(--color-border) pt-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-(--color-gold-dark)">
                                Total to Pay
                            </p>

                            <p className="mt-1 text-[10px] text-(--color-text-muted)">
                                Including delivery
                            </p>
                        </div>

                        <span className="font-serif text-2xl tabular-nums text-(--color-text)">
                            {formatPrice(totalToPay)}
                        </span>
                    </div>
                </div>

                <div className="mt-6 border-t border-(--color-border) pt-5">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-(--color-gold-dark)">
                        Secure Payment
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="button-gold inline-flex h-12 w-full items-center justify-center gap-3 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#3d2c10]/10 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? (
                            'Connecting to Ozow...'
                        ) : (
                            <>
                                <span>Pay with</span>

                                <Image
                                    src="/ozow.png"
                                    alt="Pay with Ozow"
                                    className="h-28 w-auto object-contain"
                                    width={200}
                                    height={80}
                                />

                                <span>
                                    <ArrowRight size={14} />
                                </span>
                            </>
                        )}
                    </button>

                    <div className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-(--color-text-muted)">
                        <ShieldCheck
                            size={14}
                            className="mt-0.5 shrink-0 text-(--color-gold-dark)"
                        />

                        <span>
                            Encrypted & secure checkout processing. Your
                            payment is handled securely by Ozow.
                        </span>
                    </div>

                    <div className="mt-5 text-center">
                        <Link
                            href="/cart"
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-(--color-text-muted) transition-colors hover:text-(--color-gold-dark)"
                        >
                            <ArrowLeft size={13} />
                            Back to Cart
                        </Link>
                    </div>
                </div>
            </section>

            <div className="mt-4 flex items-center justify-center gap-2 px-3 text-center text-[10px] leading-5 text-(--color-text-muted)">
                <Lock
                    size={12}
                    className="shrink-0 text-(--color-gold-dark)"
                />
                Your details are used only to process and deliver
                your order.
            </div>
        </aside>
    );
}
