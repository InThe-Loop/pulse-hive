import {
    Package,
    Store,
    Users,
} from 'lucide-react';

import type {
    CatalogueTab,
    CatalogueTabConfig,
    ResellerProduct,
} from './types';

export const PRODUCT_PAGE_SIZE = 9;
export const SEARCH_DEBOUNCE_MS = 300;

export const resellerProducts: ResellerProduct[] = [
    {
        id: 'r1',
        image: '/products/starterpack.png',
        name: 'Reseller Starter Pack',
        price: 2600,
        size: '29 items',
        description:
            'Curated mix of top-selling items designed to kickstart your Glowa Vee reseller business. 5x Cream, 5x Capsules, 5x Serum, 5x Bar soaps, 5x Day Creams, 2x Body Hydrating Lotions, 2x Skin Brightening Glow Body Gels',
    },
];

export const bannerSlides = [
    {
        title: 'Laser Skin Tag Removal',
        subtitle:
            'Target unwanted skin tags with our laser skin tag removal solution for smoother, clearer-looking skin.',
        tag: 'Laser Skin Tag Remover',
        image: '/banners/banner5.jpg',
    },
    {
        title: 'Glow From Head to Toe',
        subtitle:
            'Discover our collection of skincare and wellness products designed to help you look and feel your best.',
        tag: 'Shop Our Collection',
        image: '/banners/banner1.jpg',
    },
    {
        title: 'Say Goodbye to Skin Tags',
        subtitle:
            'Target the appearance of unwanted skin tags and reveal smoother, clearer-looking skin.',
        tag: 'Skin Tag Care',
        image: '/banners/banner2.jpg',
    },
    {
        title: 'Restore Your Skin’s Natural Beauty',
        subtitle:
            'Give your skin the care it deserves and work towards a smoother, healthier-looking appearance.',
        tag: 'Skin Care',
        image: '/banners/banner3.jpg',
    },
    {
        title: 'Your Journey to a Healthier You',
        subtitle:
            'Support your weight-loss journey with products designed to help you feel confident in your body.',
        tag: 'Weight Management',
        image: '/banners/banner4.jpg',
    },
];

export const catalogueTabs: CatalogueTabConfig[] = [
    {
        id: 'products',
        label: 'Products',
        icon: Store,
    },
    {
        id: 'combos',
        label: 'Combos & Specials',
        icon: Package,
    },
    {
        id: 'resellers',
        label: 'Resellers',
        icon: Users,
    },
];

export function getCatalogueSection(
    tab: CatalogueTab,
) {
    switch (tab) {
        case 'products':
            return 'PRODUCT' as const;

        case 'combos':
            return 'COMBO_SPECIAL' as const;

        case 'resellers':
            return null;
    }
}
