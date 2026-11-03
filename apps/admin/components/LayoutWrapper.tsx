'use client';

import Navbar from '@/components/NavBar';
import PublicFooter from '@/components/marketing/PublicFooter';
import { usePathname } from 'next/navigation';

const PUBLIC_ROUTES = new Set([
    '/',
    '/about',
    '/pricing',
    '/contact',
]);

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname() || '/';

    const isLandingPage = pathname === '/';
    const isAuthPage = pathname.startsWith('/auth');
    const isPublicPage = PUBLIC_ROUTES.has(pathname);

    return (
        <>
            <Navbar />

            <main
                className={`flex-1 w-full ${
                    isLandingPage
                        ? 'px-0 pt-[76px] pb-0 overflow-hidden bg-slate-950'
                        : isAuthPage
                            ? 'px-4 sm:px-6 lg:px-8 py-8'
                            : 'px-4 sm:px-6 lg:px-8 pt-[108px] pb-8'
                }`}
            >
                {children}
            </main>

            {isPublicPage && <PublicFooter />}
        </>
    );
}