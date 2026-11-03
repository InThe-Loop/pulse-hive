'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    apiCall,
    clearSelectedTenantId,
    setSelectedTenantId,
} from '@/lib/api-client';

type Membership = {
    id: string;
    role: string;
    status: string;
    tenant: {
        id: string;
        name: string;
        slug: string;
        tenantCode: string;
    };
};

export default function WorkspacesPage() {
    const router = useRouter();

    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectingId, setSelectingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const loadWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const result = await apiCall<Membership[]>('/auth/memberships');

            const active = result.filter(
                (membership) => membership.status === 'ACTIVE',
            );

            if (active.length === 0) {
                clearSelectedTenantId();
                router.replace('/auth/onboarding');
                return;
            }

            if (active.length === 1) {
                setSelectedTenantId(active[0].tenant.id);
                router.replace('/dashboard');
                return;
            }

            setMemberships(active);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load your workspaces.',
            );
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        void loadWorkspaces();
    }, [loadWorkspaces]);

    function selectWorkspace(membership: Membership) {
        setSelectingId(membership.id);
        setError('');

        setSelectedTenantId(membership.tenant.id);
        router.replace('/dashboard');
    }

    return (
        <div className="relative isolate flex min-h-[calc(100dvh-8rem)] w-full items-center text-white">
            {/* Full viewport background - matches the homepage */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 bg-slate-950"
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[32px_32px]" />
            </div>

            {/* Main content */}
            <section className="relative z-10 w-full">
                <div className="grid w-full items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

                    {/* Introduction */}
                    <div className="max-w-xl">
                        <div className="mb-6 inline-flex items-center gap-2.5">
                            <span className="h-px w-8 bg-indigo-400" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                                Your workspace
                            </span>
                        </div>

                        <h1 className="text-4xl font-black leading-[1.12] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.6rem]">
                            Where would you
                            <br />
                            like to{' '}
                            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                work?
                            </span>
                        </h1>

                        <p className="mt-5 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
                            Choose a workspace to continue. Each workspace
                            gives you access to the business, its orders and
                            the tools you need to keep things moving.
                        </p>

                        <div className="mt-8 hidden items-center gap-4 border-t border-white/[0.08] pt-6 lg:flex">
                            <div className="flex -space-x-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-indigo-500/20 text-xs font-bold text-indigo-200">
                                    P
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-violet-500/20 text-xs font-bold text-violet-200">
                                    H
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-300">
                                    One account. Multiple businesses.
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Your workspaces, all in one place.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Workspace panel */}
                    <div className="w-full">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-white">
                                    Select a workspace
                                </h2>

                                <p className="mt-1.5 text-xs text-slate-500">
                                    {loading
                                        ? 'Loading your access...'
                                        : `${memberships.length} available workspace${memberships.length === 1 ? '' : 's'}`}
                                </p>

                                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                                    Select a business to continue to your
                                    PulseHive dashboard.
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    Account active
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/[0.09] bg-slate-900/70 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-4">
                            {error && (
                                <div
                                    role="alert"
                                    className="mb-3 rounded-xl border border-red-400/20 bg-red-500/[0.08] p-4 text-sm text-red-200"
                                >
                                    <p className="font-bold">
                                        Unable to load workspaces
                                    </p>
                                    <p className="mt-1 leading-5 text-red-200/80">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {loading ? (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className="space-y-3"
                                >
                                    <span className="sr-only">
                                        Loading your workspaces
                                    </span>

                                    {[1, 2].map((item) => (
                                        <div
                                            key={item}
                                            className="flex animate-pulse items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                                        >
                                            <div className="h-12 w-12 rounded-xl bg-white/[0.08]" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-2/5 rounded bg-white/[0.08]" />
                                                <div className="h-3 w-1/3 rounded bg-white/[0.05]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : memberships.length > 0 ? (
                                <div className="space-y-2.5">
                                    {memberships.map((membership) => {
                                        const isSelecting =
                                            selectingId === membership.id;

                                        const initials = membership.tenant.name
                                            .trim()
                                            .split(/\s+/)
                                            .slice(0, 2)
                                            .map((part) => part.charAt(0))
                                            .join('')
                                            .toUpperCase() || 'W';

                                        return (
                                            <button
                                                key={membership.id}
                                                type="button"
                                                disabled={selectingId !== null}
                                                onClick={() =>
                                                    selectWorkspace(membership)
                                                }
                                                aria-label={`Open ${membership.tenant.name} workspace`}
                                                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition-all duration-300 hover:border-indigo-400/40 hover:bg-indigo-500/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-60 sm:p-5"
                                            >
                                                <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-indigo-400 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-sm font-black tracking-wide text-indigo-200 transition-all duration-300 group-hover:border-indigo-400/40 group-hover:from-indigo-500/30 group-hover:to-violet-500/20">
                                                    {initials}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-sm font-bold text-white transition-colors group-hover:text-indigo-100 sm:text-base">
                                                        {membership.tenant.name}
                                                    </h3>

                                                    <p className="mt-1 truncate font-mono text-[10px] tracking-wide text-slate-500">
                                                        {membership.tenant.tenantCode}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap items-center gap-2.5">
                                                        <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-semibold capitalize text-slate-300">
                                                            {membership.role.toLowerCase()}
                                                        </span>

                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-300/90">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-slate-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:border-indigo-400/30 group-hover:bg-indigo-500/10 group-hover:text-indigo-200">
                                                    {isSelecting ? (
                                                        <svg
                                                            aria-hidden="true"
                                                            viewBox="0 0 20 20"
                                                            fill="none"
                                                            className="h-4 w-4 animate-spin"
                                                        >
                                                            <circle
                                                                cx="10"
                                                                cy="10"
                                                                r="7"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                opacity="0.25"
                                                            />
                                                            <path
                                                                d="M17 10a7 7 0 0 0-7-7"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    ) : (
                                                        <svg
                                                            aria-hidden="true"
                                                            viewBox="0 0 20 20"
                                                            fill="none"
                                                            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                                        >
                                                            <path
                                                                d="M4 10h12m-5-5 5 5-5 5"
                                                                stroke="currentColor"
                                                                strokeWidth="1.6"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : !error ? (
                                <div className="rounded-xl border border-dashed border-white/10 px-5 py-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                                        <svg
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M4.5 7.8 12 12l7.5-4.2M12 12v8.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>

                                    <h3 className="mt-4 text-sm font-bold text-white">
                                        No workspaces available
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-400">
                                        You don’t currently have access to a
                                        workspace. We’ll help you set one up.
                                    </p>
                                </div>
                            ) : null}

                            <div className="mt-3 flex flex-col gap-3 border-t border-white/[0.07] px-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-[11px] leading-5 text-slate-500">
                                    Access is managed through your workspace
                                    membership.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => void loadWorkspaces()}
                                    disabled={loading || selectingId !== null}
                                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                                >
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                    >
                                        <path
                                            d="M16 8a6 6 0 0 0-10.8-2L4 8m0-4v4h4m-4 4a6 6 0 0 0 10.8 2L16 12m0 4v-4h-4"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    Refresh workspaces
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
