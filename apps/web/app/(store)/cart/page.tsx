'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
    ArrowRight,
    Minus,
    Plus,
    Trash2,
    ShoppingCart,
    Truck,
    Lock,
    PackageCheck,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';

const COURIER_OPTIONS = [
    {
        id: 'tcg-locker',
        name: 'Locker to Locker',
        time: '2–5 business days',
        price: 80,
        desc: 'Secure 24/7 self-service PUDO locker pickup',
    },
    {
        id: 'tcg-door',
        name: 'Door to Door',
        time: '1–3 business days',
        price: 180,
        desc: 'Direct delivery straight to your doorstep',
    },
];

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const [selectedShipping, setSelectedShipping] = useState<any>(null);

    const subtotal = cart.reduce(
        (sum: number, item: any) =>
            sum + item.price * item.quantity,
        0
    );

    const totalToPay = selectedShipping
        ? subtotal + selectedShipping.price
        : subtotal;

    const handleSelectShipping = (option: any) => {
        setSelectedShipping(option);

        localStorage.setItem(
            'glowavee_selected_shipping',
            JSON.stringify(option)
        );

        localStorage.setItem(
            'glowavee_cart_summary',
            JSON.stringify({
                items: cart,
                subtotal,
                shippingFee: option.price,
                totalToPay: subtotal + option.price,
            })
        );
    };

    return (
        <div className="min-h-screen w-full bg-(--color-background) pb-12">
            <main className="mx-auto w-full max-w-[1440px] px-5 pt-6 sm:px-6 sm:pt-8">
                {cart.length === 0 ? (
                    <>
                        <div className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-8 sm:px-10 sm:py-9">
                            <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />
                            <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

                            <div className="relative z-10">
                                <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                                    Your Selection
                                </span>

                                <h1 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl">
                                    Shopping Bag
                                </h1>

                                <p className="mt-3 max-w-xl font-body text-xs leading-6 text-white/60 sm:text-sm">
                                    Review your selected beauty essentials and
                                    choose your preferred delivery option.
                                </p>

                                <div className="mt-5 flex items-center gap-2 text-[10px] font-medium tracking-wide text-white/50">
                                    <Lock
                                        size={12}
                                        className="text-(--color-gold-light)"
                                    />
                                    Secure checkout
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto flex w-full max-w-8xl flex-col items-center justify-center border border-(--color-border-strong) bg-(--color-surface) px-6 py-14 text-center shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:py-16">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-(--color-gold)/30 bg-[#17140f] text-(--color-gold-light)">
                                <ShoppingCart size={25} />
                            </div>

                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-dark)">
                                Your Collection
                            </span>

                            <h2 className="mt-3 font-serif text-2xl text-(--color-text)">
                                Your bag is empty
                            </h2>

                            <p className="mt-3 max-w-sm text-xs leading-6 text-(--color-text-muted)">
                                Discover our carefully curated collection
                                of beauty and wellness essentials.
                            </p>

                            <Link
                                href="/"
                                className="button-gold mt-7 inline-flex min-h-10 w-auto items-center justify-center gap-2 px-6 py-2.5 text-xs"
                            >
                                Explore Collection
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
                        {/* Cart items and header */}
                        <section className="min-w-0">
                            <div className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-8 sm:px-10 sm:py-9">
                                <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                                <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />
                                <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

                                <div className="relative z-10">
                                    <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                                        Your Selection
                                    </span>

                                    <h1 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl">
                                        Shopping Bag
                                    </h1>

                                    <p className="mt-3 max-w-xl font-body text-xs leading-6 text-white/60 sm:text-sm">
                                        Review your selected beauty essentials and
                                        choose your preferred delivery option.
                                    </p>

                                    <div className="mt-5 flex items-center gap-2 text-[10px] font-medium tracking-wide text-white/50">
                                        <Lock
                                            size={12}
                                            className="text-(--color-gold-light)"
                                        />
                                        Secure checkout
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 flex items-center justify-between border-b border-(--color-border) pb-3">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                                        Your Items
                                    </span>

                                    <p className="mt-1 text-xs text-(--color-text-muted)">
                                        Review your selected products.
                                    </p>
                                </div>

                                <span className="text-xs font-semibold text-(--color-text-muted)">
                                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                {cart.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="group flex w-full items-center justify-between gap-4 border border-(--color-border-strong) bg-(--color-surface) p-4 shadow-[0_6px_25px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-(--color-gold)/40 hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] sm:p-5"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <h2 className="line-clamp-2 text-xs font-bold text-(--color-text) sm:text-sm">
                                                {item.name}
                                            </h2>

                                            <p className="mt-2 text-[10px] font-semibold tracking-wide text-(--color-gold-dark)">
                                                R{Number(item.price).toFixed(2)} each
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                                            <div className="flex items-center gap-2 border border-(--color-border-strong) bg-(--color-background) px-2.5 py-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="text-(--color-text-muted) transition hover:text-(--color-gold-dark)"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={12} />
                                                </button>

                                                <span className="w-5 text-center text-xs font-bold tabular-nums text-(--color-text)">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="text-(--color-text-muted) transition hover:text-(--color-gold-dark)"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeFromCart(item.id)
                                                }
                                                className="p-1 text-(--color-text-muted)/50 transition hover:text-red-500"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Delivery reassurance */}
                            <div className="mt-5 border border-(--color-border) bg-(--color-surface)/50 p-4">
                                <div className="flex items-start gap-3">
                                    <PackageCheck
                                        size={17}
                                        className="mt-0.5 shrink-0 text-(--color-gold-dark)"
                                    />

                                    <div>
                                        <p className="text-xs font-semibold text-(--color-text)">
                                            Carefully prepared for delivery
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-(--color-text-muted)">
                                            Your selected products will be
                                            prepared for dispatch once your
                                            order has been confirmed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Delivery and order summary */}
                        <section className="min-w-0 border border-(--color-border-strong) bg-(--color-surface) p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-6 lg:sticky lg:top-28">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark)">
                                        <Truck size={15} />
                                        Delivery Method
                                    </label>

                                    <p className="mt-1.5 text-xs text-(--color-text-muted)">
                                        Choose your preferred delivery option.
                                    </p>
                                </div>

                                <div className="relative flex h-10 w-20 shrink-0 items-center justify-center overflow-hidden border border-(--color-border) bg-white p-1.5">
                                    <Image
                                        src="/courier-guy.svg"
                                        alt="The Courier Guy"
                                        fill
                                        className="object-contain p-1.5"
                                    />
                                </div>
                            </div>

                            <div className="mb-4 flex items-center gap-2 border-b border-(--color-border) pb-4">
                                <span className="h-1.5 w-1.5 rounded-full bg-(--color-gold)" />

                                <span className="text-[10px] font-semibold tracking-wide text-(--color-text-muted)">
                                    The Courier Guy
                                </span>
                            </div>

                            <div className="space-y-3">
                                {COURIER_OPTIONS.map((option) => {
                                    const isSelected =
                                        selectedShipping?.id === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() =>
                                                handleSelectShipping(option)
                                            }
                                            className={`flex w-full items-center justify-between gap-4 border p-4 text-left transition-all duration-300 ${
                                                isSelected
                                                    ? 'border-(--color-gold) bg-[#1a160f] shadow-[0_8px_25px_rgba(216,181,109,0.12)]'
                                                    : 'border-(--color-border-strong) bg-(--color-background) hover:border-(--color-gold)/50'
                                            }`}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                        isSelected
                                                            ? 'border-(--color-gold-light) bg-(--color-gold)'
                                                            : 'border-(--color-border-strong) bg-(--color-surface)'
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <span className="h-2 w-2 rounded-full bg-[#171512]" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <span
                                                        className={`block text-xs font-bold sm:text-sm ${
                                                            isSelected
                                                                ? 'text-white'
                                                                : 'text-(--color-text)'
                                                        }`}
                                                    >
                                                        {option.name}
                                                    </span>

                                                    <span
                                                        className={`mt-1 block text-[10px] leading-5 ${
                                                            isSelected
                                                                ? 'text-white/65'
                                                                : 'text-(--color-text-muted)'
                                                        }`}
                                                    >
                                                        {option.desc}
                                                    </span>

                                                    <span
                                                        className={`mt-1.5 block text-[9px] font-semibold tracking-wider ${
                                                            isSelected
                                                                ? 'text-(--color-gold-light)'
                                                                : 'text-(--color-gold-dark)'
                                                        }`}
                                                    >
                                                        {option.time}
                                                    </span>
                                                </div>
                                            </div>

                                            <span
                                                className={`shrink-0 text-sm font-bold tabular-nums ${
                                                    isSelected
                                                        ? 'text-(--color-gold-light)'
                                                        : 'text-(--color-gold-dark)'
                                                }`}
                                            >
                                                R{option.price}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Order summary */}
                            <div className="mt-6 space-y-3 border-t border-(--color-border) pt-5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-(--color-text-muted)">
                                        Subtotal
                                    </span>

                                    <span className="font-semibold tabular-nums text-(--color-text)">
                                        R{subtotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-(--color-text-muted)">
                                        Delivery
                                    </span>

                                    <span className="font-semibold tabular-nums text-(--color-text)">
                                        {selectedShipping
                                            ? `R${selectedShipping.price.toFixed(2)}`
                                            : 'Select method'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-t border-dashed border-(--color-border) pt-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-text)">
                                        Total to Pay
                                    </span>

                                    <span className="font-serif text-2xl font-bold tabular-nums text-(--color-gold-dark)">
                                        R{totalToPay.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Checkout */}
                            <div className="mt-6 flex flex-col">
                                {!selectedShipping ? (
                                    <div className="flex min-h-10 w-full items-center justify-center border border-[#4a402d] bg-[#2a2419] px-5 py-2.5 text-center text-xs font-semibold tracking-wide text-[#a99b7d]">
                                        Select a delivery method to continue
                                    </div>
                                ) : (
                                    <Link
                                        href="/checkout"
                                        className="button-gold flex min-h-10 w-full items-center justify-center gap-2 px-5 py-2.5 text-xs active:scale-[0.99]"
                                    >
                                        Continue to Checkout
                                        <ArrowRight size={14} />
                                    </Link>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}
