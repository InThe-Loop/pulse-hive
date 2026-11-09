'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'glowavee_welcome_seen';
const DISPLAY_DURATION = 8000;
const EXIT_DURATION = 1600;

export function WelcomeModal() {
    const [mounted, setMounted] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem(STORAGE_KEY);

        if (seen === 'true') {
            return;
        }

        window.scrollTo(0, 0);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        const timer = window.setTimeout(() => {
            closeModal();
        }, DISPLAY_DURATION);

        return () => {
            window.clearTimeout(timer);
            document.body.style.overflow = previousOverflow;
        };
    }, [mounted]);

    const closeModal = () => {
        if (closing) return;

        setClosing(true);

        window.setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, 'true');
            setMounted(false);
            setClosing(false);
            document.body.style.overflow = '';
        }, EXIT_DURATION);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2147483647,
                background: 'rgba(0, 0, 0, 0.9)',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    right: '20px',
                    height: 'calc(100dvh - 40px)',
                    maxHeight: 'calc(100dvh - 40px)',
                    overflow: 'hidden',
                    background: '#000',
                    boxSizing: 'border-box',
                    transform: closing ? 'scale(0.97)' : 'scale(1)',
                    opacity: closing ? 0 : 1,
                    transition:
                        'transform 1600ms cubic-bezier(0.22,1,0.36,1), opacity 1600ms ease',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.7)',
                }}
            >
                <img
                    src="/welcome.jpg"
                    alt="Welcome to Glowa Vee"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.22)',
                        pointerEvents: 'none',
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '55%',
                        background:
                            'linear-gradient(to top, rgba(0,0,0,0.96), rgba(0,0,0,0.55), transparent)',
                        pointerEvents: 'none',
                    }}
                />

                <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close welcome message"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        zIndex: 100,
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.95)',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                    }}
                >
                    <X size={21} strokeWidth={2.5} />
                </button>

                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        padding: '40px 24px 50px',
                        boxSizing: 'border-box',
                        color: '#fff',
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            flexShrink: 0,
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.5)',
                            background: 'rgba(0,0,0,0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        <Sparkles size={22} strokeWidth={1.8} />
                    </div>

                    <span
                        style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.4em',
                            textTransform: 'uppercase',
                            color: '#f2dda9',
                            marginBottom: '12px',
                        }}
                    >
                        Welcome
                    </span>

                    <h2
                        style={{
                            margin: 0,
                            fontSize: '36px',
                            lineHeight: 1.1,
                            fontWeight: 700,
                            color: '#fff',
                            textShadow: '0 3px 12px rgba(0,0,0,0.7)',
                        }}
                    >
                        Welcome to Glowa Vee
                    </h2>

                    <div
                        style={{
                            width: '64px',
                            height: '1px',
                            background: '#f2dda9',
                            margin: '20px 0',
                        }}
                    />

                    <p
                        style={{
                            maxWidth: '520px',
                            margin: 0,
                            fontSize: '14px',
                            lineHeight: 1.7,
                            color: 'rgba(255,255,255,0.9)',
                            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                        }}
                    >
                        Discover beauty, skincare, body care and
                        wellness essentials curated to help you feel
                        confident, cared for, and ready to glow.
                    </p>

                    <p
                        style={{
                            marginTop: '20px',
                            marginBottom: 0,
                            fontSize: '9px',
                            fontWeight: 700,
                            letterSpacing: '0.35em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.7)',
                        }}
                    >
                        Your glow starts here
                    </p>
                </div>
            </div>
        </div>
    );
}