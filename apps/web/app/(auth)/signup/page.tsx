'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    ArrowRight,
    ShieldCheck,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import { apiClient } from '@/app/api/api-client';
import { AuthPageLayout } from '@/components/auth-page-layout';
import { GoogleSignInButton } from '@/components/google-signin-button';

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(
        null,
    );

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const response = await apiClient.post<{
                token?: string;
                user?: unknown;
            }>('/auth/signup', {
                email,
                password,
                displayName: name,
            });

            if (response.token) {
                localStorage.setItem('auth_token', response.token);
            }

            setSuccessMessage(
                'Account created successfully! Redirecting...',
            );

            setTimeout(() => {
                router.push('/signin');
            }, 1200);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Registration failed. Please check your details and try again.',
            );

            setLoading(false);
        }
    };

    return (
        <AuthPageLayout
            eyebrow="Join Glowa Vee"
            title="A More Personal Beauty Experience"
            description="Create your client account to enjoy a more personal shopping experience, keep track of your orders and stay connected with our beauty concierge."
            tagline="Discover your glow."
            formTitle="Create Account"
            formDescription="A few details to get your Glowa Vee experience started."
            formScrollable={true}
        >
            {error && (
                <div
                    role="alert"
                    className="mb-5 border border-red-500/25 bg-red-500/10 p-3 text-xs leading-relaxed text-red-300"
                >
                    {error}
                </div>
            )}

            {successMessage && (
                <div
                    role="status"
                    className="mb-5 flex items-center gap-2 border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs leading-relaxed text-emerald-300"
                >
                    <CheckCircle2
                        size={16}
                        className="shrink-0"
                    />

                    <span>{successMessage}</span>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <div className="space-y-2">
                    <label
                        htmlFor="signup-name"
                        className="block text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)"
                    >
                        Full Name
                    </label>

                    <input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        autoComplete="name"
                        className="w-full border border-(--color-border-strong) bg-(--color-surface)/40 px-4 py-3.5 text-xs text-(--color-text) outline-none transition placeholder:text-(--color-text-soft) focus:border-(--color-gold)/60 focus:ring-2 focus:ring-(--color-gold)/10 sm:text-sm"
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="signup-email"
                        className="block text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)"
                    >
                        Email Address
                    </label>

                    <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        autoComplete="email"
                        className="w-full border border-(--color-border-strong) bg-(--color-surface)/40 px-4 py-3.5 text-xs text-(--color-text) outline-none transition placeholder:text-(--color-text-soft) focus:border-(--color-gold)/60 focus:ring-2 focus:ring-(--color-gold)/10 sm:text-sm"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="signup-password"
                        className="block text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)"
                    >
                        Password
                    </label>

                    <input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        autoComplete="new-password"
                        className="w-full border border-(--color-border-strong) bg-(--color-surface)/40 px-4 py-3.5 text-xs text-(--color-text) outline-none transition placeholder:text-(--color-text-soft) focus:border-(--color-gold)/60 focus:ring-2 focus:ring-(--color-gold)/10 sm:text-sm"
                        placeholder="Create a secure password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="button-gold mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 px-4 text-[10px] font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                            Creating account...
                        </>
                    ) : (
                        <>
                            Create account
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-(--color-border)" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-(--color-text-soft)">
                    Or
                </span>

                <div className="h-px flex-1 bg-(--color-border)" />
            </div>

            <GoogleSignInButton />

            <div className="mt-7 border-t border-(--color-border) pt-6 text-center">
                <p className="text-xs text-(--color-text-muted)">
                    Already have an account?{' '}
                    <Link
                        href="/signin"
                        className="font-semibold text-(--color-gold-light) transition-colors hover:text-(--color-gold)"
                    >
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-(--color-border) pt-5 text-[10px] text-(--color-text-muted)">
                <ShieldCheck
                    size={14}
                    className="text-(--color-gold)"
                />

                <span>Secure client information storage</span>
            </div>
        </AuthPageLayout>
    );
}
