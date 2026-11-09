import type { Metadata, Viewport } from 'next';
import './globals.css';

import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { StorefrontShell } from '@/components/storefront-shell';
import { CartProvider } from '@/context/cart-context';

const cormorant = Cormorant_Garamond({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-cormorant',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Glowa Vee - Collagen Skin Repair Products',
    description:
        'Discover beauty, skincare and cosmetics curated to complement your individuality.',
    applicationName: 'Glowa Vee',
    manifest: '/manifest.json',
    icons: {
        icon: '/logo.png',
        apple: '/logo.png',
    },
};

export const viewport: Viewport = {
    themeColor: '#070707',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${cormorant.variable} ${dmSans.variable}`}
        >
            <body className="min-h-screen bg-(--color-background) text-(--color-text) antialiased">
                <CartProvider>
                    <StorefrontShell>
                        {children}
                    </StorefrontShell>
                </CartProvider>
            </body>
        </html>
    );
}
