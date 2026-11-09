'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';

interface StorefrontShellProps {
    children: React.ReactNode;
}

export function StorefrontShell({
    children,
}: StorefrontShellProps) {
    const pathname = usePathname();

    const isAuthRoute =
        pathname === '/signin' || pathname === '/signup';

    return (
        <div className="flex min-h-dvh w-full flex-col overflow-x-clip bg-transparent">
            {!isAuthRoute && <NavBar />}

            <div
                className={
                    isAuthRoute
                        ? 'flex w-full flex-1 flex-col'
                        : 'mx-auto flex w-full max-w-360 flex-1 flex-col'
                }
            >
                {children}
            </div>

            {!isAuthRoute && <Footer />}
        </div>
    );
}
