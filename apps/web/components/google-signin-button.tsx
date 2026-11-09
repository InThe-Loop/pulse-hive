
export function GoogleSignInButton() {
    return (
        <button
            type="button"
            disabled
            title="Google sign-in is coming soon"
            aria-label="Continue with Google, coming soon"
            className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-3 border border-(--color-border-strong) bg-white/[0.035] px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-text-muted) opacity-55"
        >
            <svg
                viewBox="0 0 48 48"
                aria-hidden="true"
                className="h-4.5 w-4.5 shrink-0"
            >
                <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                />
                <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.27 5.64c4.25-3.93 6.7-9.72 6.7-17.29Z"
                />
                <path
                    fill="#FBBC05"
                    d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
                />
                <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.91-5.81l-7.27-5.64c-2.02 1.36-4.61 2.16-8.64 2.16-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 43.62 14.62 48 24 48Z"
                />
            </svg>

            Continue with Google

            <span className="border border-(--color-gold)/25 px-2 py-1 text-[8px] font-bold tracking-[0.12em] text-(--color-gold-light)">
                Coming soon
            </span>
        </button>
    );
}
