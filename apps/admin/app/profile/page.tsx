
'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { getProfile, updateProfile } from '@/lib/api-client';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

type SectionId =
    | 'profile'
    | 'security'
    | 'preferences'
    | 'account'
    | 'activity'
    | 'danger';

const sections: { id: SectionId; label: string; icon: string }[] = [
    { id: 'profile', label: 'Personal Profile', icon: '◉' },
    { id: 'security', label: 'Security', icon: '⬡' },
    { id: 'preferences', label: 'Preferences', icon: '⚙' },
    { id: 'account', label: 'Account Information', icon: '▤' },
    { id: 'activity', label: 'Recent Activity', icon: '◷' },
    { id: 'danger', label: 'Danger Zone', icon: '!' },
];

function StatusBadge({
    children,
    tone = 'neutral',
}: {
    children: React.ReactNode;
    tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
    const styles = {
        neutral: 'border-white/10 bg-white/5 text-slate-300',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
        danger: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[tone]}`}>
            {children}
        </span>
    );
}

function SettingRow({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 border-b border-white/5 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 max-w-lg text-xs leading-relaxed text-slate-400">
                    {description}
                </p>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function ComingSoonButton({ label }: { label: string }) {
    return (
        <button
            type="button"
            disabled
            title="Backend integration will be added in a future step"
            className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-500"
        >
            {label}
        </button>
    );
}

function Toggle({
    checked,
    onChange,
    disabled = false,
}: {
    checked: boolean;
    onChange?: (value: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
                checked ? 'bg-indigo-600' : 'bg-slate-700'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
            <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                    checked ? 'left-6' : 'left-1'
                }`}
            />
        </button>
    );
}

function Field({
    label,
    value,
    onChange,
    disabled = false,
    type = 'text',
    placeholder,
}: {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    type?: string;
    placeholder?: string;
}) {
    return (
        <label className="block space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {label}
            </span>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(event) => onChange?.(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:text-slate-500"
            />
        </label>
    );
}

export default function ProfilePage() {
    const { isAuthenticated } = useAuthGuard();
    const { user, isLoading } = useUser();

    const [activeSection, setActiveSection] = useState<SectionId>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    const [darkMode, setDarkMode] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [securityNotifications, setSecurityNotifications] = useState(true);
    const [productUpdates, setProductUpdates] = useState(false);
    const [timezone, setTimezone] = useState('Africa/Johannesburg');
    const [language, setLanguage] = useState('en-ZA');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        if (user) setName(user.displayName || '');
    }, [user]);

    const handleSaveProfile = async () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setMessageType('error');
            setMessage('Please enter your full name.');
            return;
        }

        setIsSaving(true);
        setMessage('');

        try {
            await updateProfile({ displayName: trimmedName });
            const updatedProfile = await getProfile();

            setName(updatedProfile.displayName || trimmedName);
            setIsEditing(false);
            setMessageType('success');
            setMessage('Your profile was saved successfully.');
        } catch (error) {
            setMessageType('error');
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'Unable to save your profile. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthenticated || isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading account settings...
            </div>
        );
    }

    const email = user.email || '';
    const initials = user.initials || '--';
    const role = user.role || 'User';

    return (
        <div className="space-y-10">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        Account Centre
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Account Settings
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                        Manage your identity, security, preferences and workspace details.
                    </p>
                </div>

                <StatusBadge tone="success">Signed in</StatusBadge>
            </div>

            {/* Profile overview */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500 to-indigo-800 text-3xl font-black text-white shadow-xl shadow-indigo-950/40">
                        {initials}
                        <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-xl border-4 border-slate-900 bg-emerald-500 text-xs text-white">
                            ✓
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Your identity
                        </p>
                        <h2 className="mt-1 truncate text-2xl font-black text-white">
                            {user.displayName || 'Complete your profile'}
                        </h2>
                        <p className="mt-1 truncate text-sm text-slate-400">{email}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge>{role}</StatusBadge>
                            <StatusBadge tone="success">Authenticated</StatusBadge>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveSection('profile');
                            setIsEditing(true);
                            setMessage('');
                        }}
                        className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-3 text-sm font-bold text-indigo-300 transition hover:bg-indigo-500/20"
                    >
                        Edit Profile ↗
                    </button>
                </div>
            </div>

            {/* Main settings layout */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
                <aside className="rounded-2xl border border-white/5 bg-slate-900/40 p-3">
                    <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Settings
                    </p>

                    <nav aria-label="Account settings sections" className="flex gap-1 overflow-x-auto lg:flex-col">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => {
                                    setActiveSection(section.id);
                                    setMessage('');
                                }}
                                className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition lg:w-full ${
                                    activeSection === section.id
                                        ? 'bg-indigo-600/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-base">
                                    {section.icon}
                                </span>
                                <span>{section.label}</span>
                                {activeSection === section.id && (
                                    <span className="ml-auto hidden text-indigo-400 lg:inline">›</span>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-4 rounded-xl border border-white/5 bg-slate-950/40 p-4">
                        <p className="text-xs font-bold text-white">Need a hand?</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            Need help managing your account?
                        </p>
                        <a
                            href="/support"
                            className="mt-3 inline-flex text-xs font-bold text-indigo-400 hover:text-indigo-300"
                        >
                            Visit Support →
                        </a>
                    </div>
                </aside>

                <div className="min-w-0 space-y-5">
                    {/* PERSONAL PROFILE */}
                    {activeSection === 'profile' && (
                        <>
                            <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                    <div>
                                        <h2 className="text-lg font-black text-white">Personal Profile</h2>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Your personal details and how you appear across PulseHive.
                                        </p>
                                    </div>
                                    <StatusBadge>Profile details</StatusBadge>
                                </div>

                                {message && (
                                    <div
                                        role="status"
                                        className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                                            messageType === 'success'
                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                                : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                                        }`}
                                    >
                                        {message}
                                    </div>
                                )}

                                <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <Field label="Email Address (username)" value={email} disabled />
                                    <Field
                                        label="Full Name"
                                        value={name}
                                        onChange={setName}
                                        disabled={!isEditing || isSaving}
                                        placeholder="Enter your full name"
                                    />
                                    <Field
                                        label="Phone Number"
                                        value={phone}
                                        onChange={setPhone}
                                        disabled={!isEditing}
                                        placeholder="Not configured"
                                    />
                                    <Field
                                        label="Job Title"
                                        value={jobTitle}
                                        onChange={setJobTitle}
                                        disabled={!isEditing}
                                        placeholder="e.g. Engineering Lead"
                                    />
                                </div>

                                {(phone || jobTitle) && (
                                    <p className="mt-4 text-xs text-amber-300">
                                        Phone number and job title are currently form-only; saving them requires backend support.
                                    </p>
                                )}

                                <div className="mt-7 flex flex-wrap gap-3 border-t border-white/5 pt-6">
                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setName(user.displayName || '');
                                                setIsEditing(true);
                                                setMessage('');
                                            }}
                                            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
                                        >
                                            Edit Details
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                disabled={isSaving}
                                                onClick={handleSaveProfile}
                                                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isSaving}
                                                onClick={() => {
                                                    setName(user.displayName || '');
                                                    setPhone('');
                                                    setJobTitle('');
                                                    setIsEditing(false);
                                                    setMessage('');
                                                }}
                                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8">
                                <h3 className="text-sm font-bold text-white">Profile Picture</h3>
                                <p className="mt-1 text-xs text-slate-400">
                                    Personalise your PulseHive identity.
                                </p>

                                <div className="mt-5 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white">
                                        {initials}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-white">Initials avatar</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Generated automatically from your name.
                                        </p>
                                    </div>
                                    <ComingSoonButton label="Upload Photo" />
                                </div>
                            </section>
                        </>
                    )}

                    {/* SECURITY */}
                    {activeSection === 'security' && (
                        <>
                            <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8">
                                <h2 className="text-lg font-black text-white">Security & Authentication</h2>
                                <p className="mt-1 text-xs text-slate-400">
                                    Manage how you sign in and protect your account.
                                </p>

                                <div className="mt-5">
                                    <SettingRow
                                        title="Password"
                                        description="Update your password to help keep your account secure."
                                    >
                                        <ComingSoonButton label="Change Password" />
                                    </SettingRow>
                                    <SettingRow
                                        title="Two-factor authentication"
                                        description="Add an extra verification step when signing in."
                                    >
                                        <StatusBadge tone="warning">Not configured</StatusBadge>
                                    </SettingRow>
                                    <SettingRow
                                        title="Login notifications"
                                        description="Receive alerts about important account security events."
                                    >
                                        <StatusBadge tone="neutral">Planned</StatusBadge>
                                    </SettingRow>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Active Sessions</h3>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Review devices and sessions that have access to your account.
                                        </p>
                                    </div>
                                    <span className="text-xl">⌘</span>
                                </div>

                                <div className="mt-5 flex items-center gap-4 rounded-xl border border-white/5 bg-slate-950/50 p-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-lg text-emerald-300">
                                        ◉
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white">Current session</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            This authenticated browser session
                                        </p>
                                    </div>
                                    <StatusBadge tone="success">Current</StatusBadge>
                                </div>

                                <p className="mt-3 text-xs text-slate-500">
                                    Device history and remote sign-out require session-management API support.
                                </p>
                                <div className="mt-4">
                                    <ComingSoonButton label="Manage All Sessions" />
                                </div>
                            </section>
                        </>
                    )}

                    {/* PREFERENCES */}
                    {activeSection === 'preferences' && (
                        <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8">
                            <h2 className="text-lg font-black text-white">Preferences</h2>
                            <p className="mt-1 text-xs text-slate-400">
                                Tailor the PulseHive experience to your workflow.
                            </p>

                            <div className="mt-5">
                                <SettingRow
                                    title="Dark interface"
                                    description="Use the dark appearance throughout the console. This preview setting is local to this page."
                                >
                                    <Toggle checked={darkMode} onChange={setDarkMode} />
                                </SettingRow>

                                <SettingRow
                                    title="Email notifications"
                                    description="Preference preview for general product and account emails."
                                >
                                    <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
                                </SettingRow>

                                <SettingRow
                                    title="Security alerts"
                                    description="Preference preview for sign-in and security notifications."
                                >
                                    <Toggle checked={securityNotifications} onChange={setSecurityNotifications} />
                                </SettingRow>

                                <SettingRow
                                    title="Product updates"
                                    description="Preference preview for new features and product announcements."
                                >
                                    <Toggle checked={productUpdates} onChange={setProductUpdates} />
                                </SettingRow>
                            </div>

                            <div className="mt-7 grid grid-cols-1 gap-5 border-t border-white/5 pt-6 sm:grid-cols-2">
                                <label className="block space-y-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Timezone
                                    </span>
                                    <select
                                        value={timezone}
                                        onChange={(event) => setTimezone(event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="Africa/Johannesburg">South Africa (SAST)</option>
                                        <option value="UTC">UTC</option>
                                        <option value="Europe/London">London</option>
                                        <option value="America/New_York">New York</option>
                                    </select>
                                </label>

                                <label className="block space-y-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Language & Region
                                    </span>
                                    <select
                                        value={language}
                                        onChange={(event) => setLanguage(event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="en-ZA">English (South Africa)</option>
                                        <option value="en-GB">English (United Kingdom)</option>
                                        <option value="en-US">English (United States)</option>
                                    </select>
                                </label>
                            </div>

                            <div className="mt-5 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-200/80">
                                Preferences currently update this page's temporary UI state only. They are not persisted or applied globally yet.
                            </div>

                            <div className="mt-5">
                                <ComingSoonButton label="Save Preferences" />
                            </div>
                        </section>
                    )}

                    {/* ACCOUNT INFORMATION */}
                    {activeSection === 'account' && (
                        <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8">
                            <h2 className="text-lg font-black text-white">Account Information</h2>
                            <p className="mt-1 text-xs text-slate-400">
                                Identity and workspace information associated with your account.
                            </p>

                            <div className="mt-6 space-y-4">
                                {[
                                    ['Display Name', user.displayName || 'Not set'],
                                    ['Email Address', email || 'Not set'],
                                    ['Account Role', role],
                                    ['Account Identifier', (user as any).id || 'Provided by account service'],
                                    ['Workspace', (user as any).companyName || (user as any).tenantName || 'Not configured'],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                                    >
                                        <span className="text-xs text-slate-500">{label}</span>
                                        <span className="break-all text-sm font-semibold text-slate-200 sm:text-right">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-4">
                                <p className="text-sm font-bold text-white">Workspace management</p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                    Subscription, company membership and role changes will be connected to their respective services as those features are implemented.
                                </p>
                            </div>
                        </section>
                    )}

                    {/* ACTIVITY */}
                    {activeSection === 'activity' && (
                        <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8">
                            <h2 className="text-lg font-black text-white">Recent Account Activity</h2>
                            <p className="mt-1 text-xs text-slate-400">
                                A future audit trail for important account events.
                            </p>

                            <div className="mt-8 space-y-6">
                                {[
                                    {
                                        title: 'Current account session',
                                        description: 'You are signed in to the PulseHive console.',
                                        icon: '◉',
                                    },
                                    {
                                        title: 'Profile settings',
                                        description: 'Your profile details can be managed from this page.',
                                        icon: '✎',
                                    },
                                    {
                                        title: 'Security monitoring',
                                        description: 'Login history and security events will appear here when audit logging is connected.',
                                        icon: '⬡',
                                    },
                                ].map((item, index) => (
                                    <div key={item.title} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/15 bg-indigo-500/10 text-indigo-300">
                                                {item.icon}
                                            </span>
                                            {index < 2 && <span className="mt-2 h-8 w-px bg-white/10" />}
                                        </div>
                                        <div className="flex-1 pb-3">
                                            <p className="text-sm font-bold text-white">{item.title}</p>
                                            <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                                {item.description}
                                            </p>
                                        </div>
                                        <StatusBadge>Preview</StatusBadge>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 border-t border-white/5 pt-5">
                                <ComingSoonButton label="View Full Activity Log" />
                            </div>
                        </section>
                    )}

                    {/* DANGER ZONE */}
                    {activeSection === 'danger' && (
                        <section className="rounded-2xl border border-rose-500/20 bg-slate-900/40 p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-xl text-rose-400">
                                    !
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white">Danger Zone</h2>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                        Actions in this section may affect your access and account data. Destructive operations are not enabled yet.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 divide-y divide-white/5">
                                <SettingRow
                                    title="Deactivate Account"
                                    description="Temporarily disable account access. This will require a backend workflow and confirmation."
                                >
                                    <ComingSoonButton label="Deactivate" />
                                </SettingRow>
                                <SettingRow
                                    title="Delete Account"
                                    description="Permanently delete your account and handle any associated data according to the applicable retention policy."
                                >
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirmation((open) => !open)}
                                        className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
                                    >
                                        {showDeleteConfirmation ? 'Hide Details' : 'Review Deletion'}
                                    </button>
                                </SettingRow>
                            </div>

                            {showDeleteConfirmation && (
                                <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
                                    <p className="text-sm font-bold text-rose-300">
                                        Account deletion is not enabled
                                    </p>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                                        No account will be deleted by this screen. Before enabling deletion, we'll implement identity verification, explicit confirmation, data-retention rules and the required backend endpoint.
                                    </p>
                                    <div className="mt-4">
                                        <ComingSoonButton label="Deletion Unavailable" />
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    <div className="flex flex-col justify-between gap-2 px-1 text-[10px] text-slate-600 sm:flex-row">
                        <span>PulseHive Account Centre</span>
                        <span>Security and preference integrations are being built incrementally.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
