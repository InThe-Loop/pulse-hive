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
    ShieldCheck,
    Lock,
    Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';

const COURIER_OPTIONS = [
    {
        id: 'tcg-locker',
        name: 'Locker to Locker',
        time: '2-5 business days',
        price: 80,
        desc: 'Secure 24/7 self-service PUDO locker pickup',
    },
    {
        id: 'tcg-door',
        name: 'Door to Door',
        time: '1-3 business days',
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
        <div className="w-full min-h-screen bg-(--color-background) pb-16">
            <main className="flex flex-col gap-7 px-5 sm:px-6 pt-7">
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles
                            size={12}
                            className="text-(--color-gold)"
                        />

                        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-(--color-gold-dark)">
                            Your Selection
                        </span>

                        <Sparkles
                            size={12}
                            className="text-(--color-gold)"
                        />
                    </div>

                    <h1 className="text-3xl font-serif text-(--color-text)">
                        Shopping Bag
                    </h1>

                    <div className="flex items-center gap-1.5 mt-2 text-[10px] uppercase tracking-widest text-(--color-text-muted)">
                        <Lock size={11} />
                        Secure Checkout
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="w-full border border-(--color-border-strong) bg-(--color-surface) p-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-black flex items-center justify-center text-(--color-gold-light) mb-5 border border-(--color-gold)/30 rounded-full shadow-lg">
                            <ShoppingCart size={26} />
                        </div>

                        <h2 className="text-xl font-serif text-(--color-text) mb-2">
                            Your bag is empty
                        </h2>

                        <p className="text-xs leading-5 text-(--color-text-muted) max-w-xs mb-7">
                            Discover our carefully curated collection
                            of beauty and wellness essentials.
                        </p>

                        <div className="h-10" />

                        <Link
                            href="/"
                            className="button-gold w-full min-h-12"
                        >
                            Explore Collection
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <>
                        <section className="w-full">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-text-muted)">
                                    Your Items
                                </span>

                                <span className="text-[10px] text-(--color-gold-dark) font-semibold">
                                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>

                            <div className="flex w-full flex-col gap-3">
                                {cart.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="group flex w-full items-center justify-between border border-(--color-border-strong) bg-(--color-surface) p-4 sm:p-5 shadow-[0_6px_25px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-(--color-gold)/40 hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)]"
                                    >
                                        <div className="flex flex-col gap-1 pr-4 min-w-0">
                                            <h2 className="text-xs sm:text-sm font-bold text-(--color-text) line-clamp-2">
                                                {item.name}
                                            </h2>

                                            <p className="text-[10px] uppercase tracking-wider text-(--color-gold-dark) font-semibold">
                                                R{Number(item.price).toFixed(2)} each
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                                            <div className="flex items-center gap-2 border border-(--color-border-strong) bg-(--color-background) px-2.5 py-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="text-(--color-text-muted) hover:text-(--color-gold-dark) transition"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={12} />
                                                </button>

                                                <span className="w-5 text-center text-xs font-bold text-(--color-text)">
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
                                                    className="text-(--color-text-muted) hover:text-(--color-gold-dark) transition"
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
                                                className="text-(--color-text-muted)/50 hover:text-red-500 transition p-1"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="w-full border border-(--color-border-strong) bg-(--color-surface) p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                            <div className="flex flex-col gap-4 mb-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-dark) flex items-center gap-2 mb-1.5">
                                            <Truck size={15} />
                                            Delivery Method
                                        </label>

                                        <p className="text-xs text-(--color-text-muted)">
                                            Select your preferred delivery option.
                                        </p>
                                    </div>

                                    <div className="relative w-16 h-8 shrink-0 overflow-hidden border border-(--color-border-strong) bg-white flex items-center justify-center">
                                        <Image
                                            src="/courier.jpg"
                                            alt="The Courier Guy"
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-(--color-text-soft)">
                                    <span className="w-1.5 h-1.5 rounded-full bg-(--color-gold)" />
                                    The Courier Guy
                                </div>
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
                                            className={`w-full flex items-center justify-between gap-4 p-4 border transition-all duration-300 text-left ${
                                                isSelected
                                                    ? 'border-(--color-gold) bg-[#1a160f] shadow-[0_8px_25px_rgba(216,181,109,0.12)]'
                                                    : 'border-(--color-border-strong) bg-(--color-background) hover:border-(--color-gold)/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
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
                                                        className={`text-xs sm:text-sm font-bold block ${
                                                            isSelected
                                                                ? 'text-white'
                                                                : 'text-(--color-text)'
                                                        }`}
                                                    >
                                                        {option.name}
                                                    </span>

                                                    <span
                                                        className={`text-[10px] block mt-0.5 ${
                                                            isSelected
                                                                ? 'text-white/65'
                                                                : 'text-(--color-text-muted)'
                                                        }`}
                                                    >
                                                        {option.desc}
                                                    </span>

                                                    <span
                                                        className={`text-[9px] uppercase tracking-wider block mt-1 ${
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
                                                className={`text-xs sm:text-sm font-bold shrink-0 ${
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

                            <div className="space-y-3 pt-6 mt-6 border-t border-(--color-border)">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-(--color-text-muted)">
                                        Subtotal
                                    </span>

                                    <span className="font-semibold text-(--color-text)">
                                        R{subtotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-(--color-text-muted)">
                                        Delivery
                                    </span>

                                    <span className="font-semibold text-(--color-text)">
                                        {selectedShipping
                                            ? `R${selectedShipping.price.toFixed(2)}`
                                            : 'Select method'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-4 mt-2 border-t border-dashed border-(--color-border)">
                                    <span className="text-xs font-bold uppercase tracking-wider text-(--color-text)">
                                        Total to Pay
                                    </span>

                                    <span className="text-xl font-bold text-(--color-gold-dark)">
                                        R{totalToPay.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="h-10" />

                            {!selectedShipping ? (
                                <div className="w-full h-12 mt-7 flex items-center justify-center gap-2 bg-[#2a2419] border border-[#4a402d] text-[10px] font-bold uppercase tracking-wider text-[#8f846f]">
                                    Select delivery method to continue
                                </div>
                            ) : (
                                <Link
                                    href="/checkout"
                                    className="button-gold mt-7 w-full min-h-12 active:scale-[0.99]"
                                >
                                    Continue to Checkout
                                    <ArrowRight size={16} />
                                </Link>
                            )}

                            <div className="flex items-center justify-center gap-1.5 mt-5 text-[9px] uppercase tracking-wider text-(--color-text-muted)">
                                <ShieldCheck
                                    size={13}
                                    className="text-(--color-gold-dark)"
                                />

                                <span>
                                    Encrypted & secure checkout processing
                                </span>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
