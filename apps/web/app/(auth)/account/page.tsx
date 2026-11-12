'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    UserRound,
    Package,
    MapPin,
    LogOut,
    ArrowRight,
    ShieldCheck,
    Loader2,
    Save,
    CheckCircle2,
    Phone,
    Headphones,
    Trash2,
    AlertTriangle,
    X,
    Info,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { customerApiClient } from '@/app/api/api-client';

const TENANT_CODE = 'GLV-000001';

interface CustomerIdentity {
    id: string;
    phone: string;
}

interface CustomerProfile {
    id?: string;
    name: string;
    phone?: string;
    address?: string | null;
}

interface ProfileResponse {
    profile?: CustomerProfile | null;
    data?: CustomerProfile | null;
}

export default function AccountPage() {
    const { orders } = useCart();
    const router = useRouter();

    const [identity, setIdentity] = useState<CustomerIdentity | null>(null);
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchUserData = async () => {
            const token = localStorage.getItem('customer_auth_token');

            if (!token) {
                router.replace('/signin');
                return;
            }

            try {
                const customer = await customerApiClient.get<CustomerIdentity>(
                    '/customer/auth/me'
                );

                const profileResponse =
                    await customerApiClient.get<
                        CustomerProfile | ProfileResponse | null
                    >('/customer/profile', {
                        params: {
                            tenantCode: TENANT_CODE,
                        },
                    });

                const returnedProfile =
                    profileResponse &&
                    typeof profileResponse === 'object' &&
                    'profile' in profileResponse
                        ? profileResponse.profile
                        : profileResponse &&
                            typeof profileResponse === 'object' &&
                            'data' in profileResponse
                          ? profileResponse.data
                          : profileResponse as CustomerProfile | null;

                if (!active) {
                    return;
                }

                setIdentity(customer);
                setProfile(returnedProfile ?? null);
                setName(returnedProfile?.name ?? '');
                setAddress(returnedProfile?.address ?? '');
            } catch {
                if (!active) {
                    return;
                }

                setError(
                    'We could not load your account details. Please refresh and try again.'
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchUserData();

        return () => {
            active = false;
        };
    }, [router]);

    const handleSaveProfile = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError(null);
        setSuccessMessage(null);
        setSaving(true);

        try {
            const updatedProfile =
                await customerApiClient.patch<CustomerProfile>(
                    '/customer/profile',
                    {
                        name: name.trim(),
                        address: address.trim(),
                    },
                    {
                        params: {
                            tenantCode: TENANT_CODE,
                        },
                    }
                );

            setProfile(updatedProfile);
            setName(updatedProfile.name);
            setAddress(updatedProfile.address ?? '');
            setSuccessMessage('Your profile has been updated successfully.');
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to update your profile. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customer_auth_token');
        router.replace('/signin');
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center bg-(--color-background)">
                <div className="flex flex-col items-center gap-3">
                    <Loader2
                        size={25}
                        className="animate-spin text-(--color-gold)"
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-text-muted)">
                        Preparing your account
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-(--color-background) pb-20 text-(--color-text)">
            <style jsx global>{`
                #account-phone {
                    background-color: #39352e;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: #ffffff;
                    cursor: not-allowed;
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.25);
                }

                #account-phone:focus {
                    border-color: rgba(255, 255, 255, 0.3);
                    outline: none;
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.25);
                }

                #account-phone:read-only {
                    opacity: 1;
                    -webkit-text-fill-color: #ffffff;
                }
            `}</style>

            <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 pt-10 sm:px-6 sm:pt-14 lg:gap-10 lg:pt-16">
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.65fr)]">
                    <aside className="flex min-w-0 flex-col gap-5">
                        <section className="relative overflow-hidden border border-(--color-border-strong) bg-[linear-gradient(155deg,#1b1812_0%,#12110f_58%,#0d0d0c_100%)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.2)] sm:p-7">
                            <div className="absolute inset-x-0 top-0 h-px gold-foil opacity-70" />

                            <div className="flex items-center justify-between border-b border-(--color-border) pb-5">
                                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-(--color-gold)">
                                    Client overview
                                </span>
                                <UserRound
                                    size={18}
                                    className="text-(--color-gold)"
                                />
                            </div>

                            <div className="mt-5 border-b border-(--color-border) pb-5">
                                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-soft)">
                                    Orders in your session
                                </span>
                                <div className="mt-2 flex items-end gap-2">
                                    <span className="font-display text-4xl font-semibold text-(--color-text)">
                                        {orders.length}
                                    </span>
                                    <span className="pb-1 text-[10px] text-(--color-text-muted)">
                                        {orders.length === 1 ? 'order' : 'orders'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-(--color-gold)/20 bg-(--color-gold)/5 text-(--color-gold)">
                                        <Phone size={15} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="block text-[9px] uppercase tracking-[0.16em] text-(--color-text-soft)">
                                            Verified number
                                        </span>
                                        <span className="mt-1 block truncate text-xs text-(--color-text)">
                                            {identity?.phone ?? 'Not available'}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    id="delivery-address"
                                    className="flex items-start gap-3 border-t border-(--color-border) pt-5"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-(--color-gold)/20 bg-(--color-gold)/5 text-(--color-gold)">
                                        <MapPin size={15} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-(--color-text-soft)">
                                                Delivery address
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-400">
                                                {profile?.address ? (
                                                    <>
                                                        <CheckCircle2
                                                            size={11}
                                                            className="text-emerald-400"
                                                        />
                                                        Saved
                                                    </>
                                                ) : (
                                                    'Pending'
                                                )}
                                            </span>
                                        </div>
                                        <p className="mt-2 break-words text-xs leading-5 text-(--color-text-muted)">
                                            {profile?.address ||
                                                'No delivery address saved yet.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="border border-(--color-border-strong) bg-(--color-surface-elevated)/70 p-6 sm:p-7">
                            <h2 className="font-display text-xl font-semibold text-(--color-text)">
                                Account & Support
                            </h2>

                            <nav className="mt-5 divide-y divide-(--color-border) border-y border-(--color-border)">
                                <Link
                                    href="/orders"
                                    className="group flex items-center justify-between gap-3 py-4 transition-colors hover:text-(--color-gold)"
                                >
                                    <span className="flex items-center gap-3">
                                        <Package
                                            size={16}
                                            className="text-(--color-gold)"
                                        />
                                        <span className="text-xs font-medium">
                                            Order history
                                        </span>
                                    </span>
                                    <ArrowRight
                                        size={14}
                                        className="text-(--color-text-muted) transition-transform group-hover:translate-x-1 group-hover:text-(--color-gold)"
                                    />
                                </Link>

                                <Link
                                    href="/contact"
                                    className="group flex items-center justify-between gap-3 py-4 transition-colors hover:text-(--color-gold)"
                                >
                                    <span className="flex items-center gap-3">
                                        <Headphones
                                            size={16}
                                            className="text-(--color-gold)"
                                        />
                                        <span className="text-xs font-medium">
                                            Customer care
                                        </span>
                                    </span>
                                    <ArrowRight
                                        size={14}
                                        className="text-(--color-text-muted) transition-transform group-hover:translate-x-1 group-hover:text-(--color-gold)"
                                    />
                                </Link>
                            </nav>

                            <div className="mt-6 space-y-5">
                                {!showDeleteConfirmation ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirmation(true)}
                                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-red-500/30 bg-red-500/5 px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-300 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-200"
                                    >
                                        <Trash2 size={14} />
                                        Delete account
                                    </button>
                                ) : (
                                    <div className="border border-red-500/25 bg-red-500/5 p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle
                                                size={16}
                                                className="mt-0.5 shrink-0 text-red-300"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold text-red-200">
                                                    Request account deletion
                                                </p>
                                                <p className="mt-2 text-[10px] leading-5 text-(--color-text-muted)">
                                                    Account deletion needs to be handled securely by our support team. Contact us to request deletion of your customer account and associated personal information.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-3">
                                            <Link
                                                href="/contact"
                                                className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 bg-red-500/15 px-3 text-[9px] font-bold uppercase tracking-wider text-red-200 transition-colors hover:bg-red-500/25"
                                            >
                                                Contact support
                                                <ArrowRight size={12} />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteConfirmation(false)}
                                                aria-label="Cancel account deletion request"
                                                className="flex h-9 w-9 shrink-0 items-center justify-center border border-(--color-border-strong) text-(--color-text-muted) transition-colors hover:text-(--color-text)"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-(--color-border) pt-5">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-(--color-border-strong) bg-transparent px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-text-muted) transition-all hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-300"
                                    >
                                        <LogOut size={14} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </section>
                    </aside>

                    <div className="flex min-w-0 flex-col gap-6">
                        <header className="relative overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-9 sm:px-10 sm:py-11 lg:px-12">
                            <div className="absolute inset-x-0 top-0 h-px gold-foil opacity-80" />
                            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-(--color-gold)/10" />
                            <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-(--color-gold)/10" />

                            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="max-w-2xl">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-(--color-gold)">
                                        Welcome to your account
                                    </span>
                                    <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-(--color-text) sm:text-4xl">
                                        Welcome back
                                        {profile?.name ? `, ${profile.name}` : ''}
                                    </h2>
                                    <p className="mt-3 max-w-xl text-xs leading-6 text-(--color-text-muted) sm:text-sm">
                                        Manage your personal details and delivery information, and keep track of your Glowa Vee experience.
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-3 border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 sm:ml-6">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-(--color-gold)/20 bg-(--color-gold)/5 text-(--color-gold)">
                                        <UserRound size={18} />
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-(--color-text-soft)">
                                            Account status
                                        </span>
                                        <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                                            <CheckCircle2 size={13} />
                                            Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {error && (
                            <div
                                role="alert"
                                className="border border-red-500/25 bg-red-500/10 p-4 text-xs leading-relaxed text-red-300"
                            >
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div
                                role="status"
                                className="flex items-center gap-2 border border-emerald-500/25 bg-emerald-500/10 p-4 text-xs leading-relaxed text-emerald-300"
                            >
                                <CheckCircle2 size={16} className="shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <section
                            id="profile-details"
                            className="scroll-mt-28 border border-(--color-border-strong) bg-(--color-surface-elevated)/70 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.12)] sm:p-8"
                        >
                            <div className="border-b border-(--color-border) pb-5">
                                <div>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-(--color-gold)">
                                        Personal information
                                    </span>
                                    <h2 className="mt-2 font-display text-2xl font-semibold text-(--color-text)">
                                        Profile Details
                                    </h2>
                                    <p className="mt-2 text-xs leading-5 text-(--color-text-muted)">
                                        Keep your account information up to date.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSaveProfile}
                                className="mt-6 space-y-5"
                            >
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label
                                                htmlFor="account-phone"
                                                className="text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)"
                                            >
                                                Verified mobile number
                                            </label>
                                            <span className="group relative inline-flex">
                                                <Info
                                                    size={13}
                                                    tabIndex={0}
                                                    aria-label="This verified number cannot be changed here."
                                                    className="cursor-help text-(--color-gold-light)"
                                                />
                                                <span
                                                    role="tooltip"
                                                    className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-sm border border-(--color-gold)/25 bg-[#211e18] px-3 py-2 text-[10px] leading-relaxed text-(--color-text) opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                                                >
                                                    This verified number cannot be changed here.
                                                </span>
                                            </span>
                                        </div>
                                        <input
                                            id="account-phone"
                                            type="tel"
                                            value={identity?.phone ?? ''}
                                            readOnly
                                            aria-readonly="true"
                                            className="w-full cursor-not-allowed px-4 py-3.5 text-xs font-semibold shadow-inner outline-none sm:text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="account-name"
                                            className="block text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)"
                                        >
                                            Full name
                                        </label>
                                        <input
                                            id="account-name"
                                            type="text"
                                            value={name}
                                            onChange={(event) =>
                                                setName(event.target.value)
                                            }
                                            autoComplete="name"
                                            required
                                            className="w-full border border-(--color-border-strong) bg-(--color-surface)/40 px-4 py-3.5 text-xs text-(--color-text) outline-none transition placeholder:text-(--color-text-soft) focus:border-(--color-gold)/60 focus:ring-2 focus:ring-(--color-gold)/10 sm:text-sm"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label
                                            htmlFor="account-address"
                                            className="text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-text-muted)"
                                        >
                                            Delivery address
                                        </label>
                                        <span className="group relative inline-flex">
                                            <Info
                                                size={13}
                                                tabIndex={0}
                                                aria-label="Keep your delivery details up to date for a smoother shopping experience."
                                                className="cursor-help text-(--color-gold-light)"
                                            />
                                            <span
                                                role="tooltip"
                                                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-sm border border-(--color-gold)/25 bg-[#211e18] px-3 py-2 text-[10px] leading-relaxed text-(--color-text) opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                                            >
                                                Keep your delivery details up to date for a smoother shopping experience.
                                            </span>
                                        </span>
                                    </div>
                                    <textarea
                                        id="account-address"
                                        value={address}
                                        onChange={(event) =>
                                            setAddress(event.target.value)
                                        }
                                        autoComplete="street-address"
                                        rows={4}
                                        className="w-full resize-y border border-(--color-border-strong) bg-(--color-surface)/40 px-4 py-3.5 text-xs text-(--color-text) outline-none transition placeholder:text-(--color-text-soft) focus:border-(--color-gold)/60 focus:ring-2 focus:ring-(--color-gold)/10 sm:text-sm"
                                        placeholder="Enter your preferred delivery address"
                                    />
                                </div>

                                <div className="flex flex-col gap-5 border-t border-(--color-border) pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck
                                            size={17}
                                            className="mt-0.5 shrink-0 text-(--color-gold)"
                                        />
                                        <div className="space-y-1 text-[10px] leading-relaxed text-(--color-text-muted)">
                                            <p>
                                                Your Glowa Vee client profile is protected and secure.
                                            </p>
                                            <p>
                                                We do not store credit card information in our systems.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving || !name.trim()}
                                        className="button-gold inline-flex min-h-12 shrink-0 items-center justify-center gap-2 px-7 text-[10px] font-bold uppercase tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2
                                                    size={15}
                                                    className="animate-spin"
                                                />
                                                Saving changes
                                            </>
                                        ) : (
                                            <>
                                                Save profile
                                                <Save size={14} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
