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
import { customerApiClient } from '@/app/api/api-client';
import { AuthPageLayout } from '@/components/auth-page-layout';

interface RequestOtpResponse {
    success: boolean;
    message?: string;
    expiresIn?: number;
    resendAvailableIn?: number;
}

interface VerifyOtpResponse {
    success: boolean;
    accessToken: string;
    customer: {
        id: string;
        phone: string;
        phoneVerifiedAt?: string;
    };
}

export default function LoginPage() {
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [otpRequested, setOtpRequested] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleRequestOtp = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await customerApiClient.post<RequestOtpResponse>(
                '/customer/auth/request-otp',
                {
                    phone: phone.trim(),
                }
            );

            setOtpRequested(true);
            setSuccessMessage(
                'Verification code sent. Please check your phone.'
            );
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to send your verification code. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const response = await customerApiClient.post<VerifyOtpResponse>(
                '/customer/auth/verify-otp',
                {
                    phone: phone.trim(),
                    code: code.trim(),
                }
            );

            if (!response.accessToken) {
                throw new Error(
                    'No customer authentication token was returned.'
                );
            }

            localStorage.setItem(
                'customer_auth_token',
                response.accessToken
            );

            setSuccessMessage('Sign-in successful. Redirecting...');
            router.replace('/account');
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Sign-in failed. Please check your verification code and try again.'
            );

            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await customerApiClient.post<RequestOtpResponse>(
                '/customer/auth/request-otp',
                {
                    phone: phone.trim(),
                }
            );

            setCode('');
            setSuccessMessage('A new verification code has been sent.');
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to resend your verification code.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPageLayout
            eyebrow="Welcome Back"
            title="Member Area"
            description="Sign in to access your account, order history and personal details."
            tagline="Your glow. Your way."
            formTitle="Sign in"
            formDescription="Access your Glowa Vee client account."
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
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {!otpRequested ? (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                    <div className="space-y-2">
                        <label
                            htmlFor="signin-phone"
                            className="block text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)"
                        >
                            Mobile Number
                        </label>

                        <input
                            id="signin-phone"
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            autoComplete="tel"
                            inputMode="tel"
                            pattern="^\+[1-9]\d{7,14}$"
                            className="w-full border border-(--color-border-strong) bg-(--color-surface)/40 px-4 py-3.5 text-xs text-(--color-text) outline-none transition placeholder:text-(--color-text-soft) focus:border-(--color-gold)/60 focus:ring-2 focus:ring-(--color-gold)/10 sm:text-sm"
                            placeholder="+27821234567"
                            required
                        />

                        <p className="text-[10px] leading-relaxed text-(--color-text-soft)">
                            Enter the mobile number linked to your account,
                            including the + country code.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="button-gold mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 px-4 text-[10px] font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Sending code...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="space-y-2">
                        <label
                            htmlFor="signin-otp"
                            className="block text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)"
                        >
                            Verification Code
                        </label>

                        <input
                            id="signin-otp"
                            type="text"
                            value={code}
                            onChange={(event) =>
                                setCode(
                                    event.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 6)
                                )
                            }
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            className="w-full border border-(--color-border-strong) bg-(--color-surface)/40 px-4 py-4 text-center text-xl tracking-[0.5em] text-(--color-text) outline-none transition placeholder:text-(--color-text-soft) focus:border-(--color-gold)/60 focus:ring-2 focus:ring-(--color-gold)/10"
                            placeholder="••••••"
                            required
                        />

                        <p className="text-[10px] leading-relaxed text-(--color-text-muted)">
                            Enter the six-digit code sent to {phone}.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="button-gold mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 px-4 text-[10px] font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="w-full py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-gold-light) transition-colors hover:text-(--color-gold) disabled:opacity-50"
                    >
                        Resend verification code
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setOtpRequested(false);
                            setCode('');
                            setError(null);
                            setSuccessMessage(null);
                        }}
                        className="w-full text-[10px] text-(--color-text-muted) transition-colors hover:text-(--color-text)"
                    >
                        Change mobile number
                    </button>
                </form>
            )}

            <div className="mt-7 border-t border-(--color-border) pt-6 text-center">
                <p className="text-xs text-(--color-text-muted)">
                    Don't have an account?{' '}
                    <Link
                        href="/signup"
                        className="font-semibold text-(--color-gold-light) transition-colors hover:text-(--color-gold)"
                    >
                        Create account
                    </Link>
                </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-(--color-border) pt-5 text-[10px] text-(--color-text-muted)">
                <ShieldCheck size={14} className="text-(--color-gold)" />
                <span>Secure client sign-in session</span>
            </div>
        </AuthPageLayout>
    );
}
