import type { LucideIcon } from 'lucide-react';

export type Product = {
    id: string;
    tenantId: string;
    name: string;
    description: string | null;
    sku: string | null;
    image: string | null;
    size: string | null;
    price: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ResellerProduct = {
    id: string;
    image: string;
    name: string;
    price: number;
    size: string;
    description: string;
};

export type CatalogueProduct = Product | ResellerProduct;

export type CatalogueTab = 'products' | 'combos' | 'resellers';

export type CatalogueSection =
    | 'PRODUCT'
    | 'COMBO_SPECIAL'
    | 'RESELLER_PACK';

export type CatalogueResponse = {
    items: Product[];
    pageInfo: {
        limit: number;
        hasMore: boolean;
        nextCursor: string | null;
    };
};

export type CatalogueTabConfig = {
    id: CatalogueTab;
    label: string;
    icon: LucideIcon;
};
