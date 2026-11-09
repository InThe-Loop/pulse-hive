'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    ArrowDownWideNarrow,
    ChevronDown,
    Filter,
    Package,
    Search,
    Store,
    Users,
} from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { WelcomeModal } from '@/components/welcome-modal';

type Product = {
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

type CatalogueTab = 'products' | 'combos' | 'resellers';

type CatalogueSection =
    | 'PRODUCT'
    | 'COMBO_SPECIAL'
    | 'RESELLER_PACK';

type CatalogueResponse = {
    items: Product[];
    pageInfo: {
        limit: number;
        hasMore: boolean;
        nextCursor: string | null;
    };
};

const PRODUCT_PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 300;

const resellerProducts = [
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

const bannerSlides = [
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

const catalogueTabs: {
    id: CatalogueTab;
    label: string;
    icon: typeof Store;
}[] = [
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

function getCatalogueSection(
    tab: CatalogueTab,
): CatalogueSection | null {
    switch (tab) {
        case 'products':
            return 'PRODUCT';

        case 'combos':
            return 'COMBO_SPECIAL';

        case 'resellers':
            return null;
    }
}

export default function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [productsError, setProductsError] = useState<string | null>(
        null,
    );
    const [loadMoreError, setLoadMoreError] = useState<string | null>(
        null,
    );

    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMoreProducts, setHasMoreProducts] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
        '',
    );

    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeTab, setActiveTab] = useState<CatalogueTab>(
        'products',
    );

    const loadMoreControllerRef = useRef<AbortController | null>(
        null,
    );
    const catalogueRequestIdRef = useRef(0);

    /* =========================================================
       HERO SLIDER
       ========================================================= */

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(
                (previous) => (previous + 1) % bannerSlides.length,
            );
        }, 4500);

        return () => clearInterval(timer);
    }, []);

    /* =========================================================
       DEBOUNCE SEARCH
       ========================================================= */

    useEffect(() => {
        const normalizedQuery = searchQuery.trim();

        if (!normalizedQuery) {
            setDebouncedSearchQuery('');
            return;
        }

        const timer = setTimeout(() => {
            setDebouncedSearchQuery(normalizedQuery);
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    /* =========================================================
       LOAD CATALOGUE FROM DB SERVICE
       ========================================================= */

    useEffect(() => {
        // A category/search change invalidates any in-flight pagination
        // request from the previous catalogue query.
        loadMoreControllerRef.current?.abort();
        loadMoreControllerRef.current = null;

        const section = getCatalogueSection(activeTab);

        setProducts([]);
        setNextCursor(null);
        setHasMoreProducts(false);
        setProductsError(null);
        setLoadMoreError(null);
        setLoadingMore(false);

        // The Starter Pack remains locally defined until reseller
        // packs are migrated into the DB catalogue.
        if (!section) {
            setProductsLoading(false);
            return;
        }

        const controller = new AbortController();
        const requestId = ++catalogueRequestIdRef.current;

        const loadProducts = async () => {
            try {
                setProductsLoading(true);

                const params = new URLSearchParams({
                    section,
                    limit: String(PRODUCT_PAGE_SIZE),
                });

                if (debouncedSearchQuery) {
                    params.set('search', debouncedSearchQuery);
                }

                const response = await fetch(
                    `/api/products?${params.toString()}`,
                    {
                        cache: 'no-store',
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load products (${response.status})`,
                    );
                }

                const data: CatalogueResponse =
                    await response.json();

                if (
                    controller.signal.aborted ||
                    catalogueRequestIdRef.current !== requestId
                ) {
                    return;
                }

                setProducts(data.items);
                setNextCursor(data.pageInfo.nextCursor);
                setHasMoreProducts(data.pageInfo.hasMore);
            } catch (error) {
                // Browsers may report an aborted fetch as either
                // AbortError or TypeError, so inspect the signal first.
                if (
                    controller.signal.aborted ||
                    catalogueRequestIdRef.current !== requestId
                ) {
                    return;
                }

                console.error(
                    'Failed to load catalogue:',
                    error,
                );

                setProductsError(
                    'Unable to load products. Please try again.',
                );
            } finally {
                // Only the latest catalogue request may clear the loading state.
                // This also handles cancelled requests without leaving the UI stuck.
                if (catalogueRequestIdRef.current === requestId) {
                    setProductsLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            controller.abort();
        };
    }, [activeTab, debouncedSearchQuery]);

    /* =========================================================
       LOAD NEXT PAGE
       ========================================================= */

    const loadMoreProducts = async () => {
        const section = getCatalogueSection(activeTab);

        if (
            !section ||
            !nextCursor ||
            loadingMore ||
            productsLoading
        ) {
            return;
        }

        // Do not allow two pagination requests to run concurrently.
        if (loadMoreControllerRef.current) {
            return;
        }

        const controller = new AbortController();

        loadMoreControllerRef.current = controller;

        setLoadingMore(true);
        setLoadMoreError(null);

        try {
            const params = new URLSearchParams({
                section,
                limit: String(PRODUCT_PAGE_SIZE),
                cursor: nextCursor,
            });

            if (debouncedSearchQuery) {
                params.set('search', debouncedSearchQuery);
            }

            const response = await fetch(
                `/api/products?${params.toString()}`,
                {
                    cache: 'no-store',
                    signal: controller.signal,
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to load more products (${response.status})`,
                );
            }

            const data: CatalogueResponse =
                await response.json();

            if (controller.signal.aborted) {
                return;
            }

            setProducts((current) => [
                ...current,
                ...data.items,
            ]);

            setNextCursor(data.pageInfo.nextCursor);
            setHasMoreProducts(data.pageInfo.hasMore);
        } catch (error) {
            if (controller.signal.aborted) {
                return;
            }

            console.error(
                'Failed to load more catalogue products:',
                error,
            );

            setLoadMoreError(
                'Unable to load more products. Please try again.',
            );
        } finally {
            if (loadMoreControllerRef.current === controller) {
                loadMoreControllerRef.current = null;
                setLoadingMore(false);
            }
        }
    };

    /* =========================================================
       RESELLER STARTER PACK SEARCH
       ========================================================= */

    const filteredResellerProducts = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return resellerProducts;
        }

        return resellerProducts.filter((product) => {
            const searchableText = [
                product.name,
                product.description,
                product.size,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchableText.includes(normalizedQuery);
        });
    }, [searchQuery]);

    const visibleProducts =
        activeTab === 'resellers'
            ? filteredResellerProducts
            : products;

    const displayedProductCount = visibleProducts.length;

    const activeTabLabel =
        catalogueTabs.find((tab) => tab.id === activeTab)?.label ??
        'Products';

    /* =========================================================
       CATEGORY BUTTON
       ========================================================= */

    const renderCategoryButton = (
        tab: (typeof catalogueTabs)[number],
        compact = false,
    ) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
            <button
                key={tab.id}
                type="button"
                onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                }}
                aria-pressed={isActive}
                className={`flex items-center gap-3 rounded-md border text-left transition-all duration-200 ${
                    compact
                        ? 'min-w-max flex-1 justify-center px-3 py-3 text-xs'
                        : 'w-full px-3.5 py-3 text-sm'
                } ${
                    isActive
                        ? 'border-(--color-gold)/60 bg-(--color-gold)/10 text-(--color-gold-light) shadow-[0_4px_18px_rgba(216,181,109,0.07)]'
                        : 'border-transparent text-(--color-text-soft) hover:border-(--color-border) hover:bg-white/2.5 hover:text-(--color-text)'
                }`}
            >
                <Icon
                    size={compact ? 15 : 17}
                    className={
                        isActive
                            ? 'shrink-0 text-(--color-gold)'
                            : 'shrink-0'
                    }
                />

                <span className="whitespace-nowrap font-medium">
                    {tab.label}
                </span>

                {!compact && isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-(--color-gold)" />
                )}
            </button>
        );
    };

    /* =========================================================
       SEARCH CONTROL
       ========================================================= */

    const renderSearch = () => (
        <div className="relative w-full">
            <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-gold)"
                size={17}
            />

            <input
                type="text"
                placeholder={
                    activeTab === 'resellers'
                        ? 'Search reseller items...'
                        : activeTab === 'combos'
                          ? 'Search combos & specials...'
                          : 'Find the right glow...'
                }
                className="w-full rounded-md border border-(--color-border-strong) bg-(--color-surface) py-3 pl-10 pr-4 text-sm text-(--color-text) shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all placeholder:text-(--color-text-soft) focus:border-(--color-gold)/50 focus:outline-none focus:ring-2 focus:ring-(--color-gold)/30"
                onChange={(event) =>
                    setSearchQuery(event.target.value)
                }
                value={searchQuery}
            />
        </div>
    );

    /* =========================================================
       FILTER / SORT PLACEHOLDERS
       ========================================================= */

    const renderCatalogueControls = () => (
        <div className="space-y-5">
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <Filter
                        size={14}
                        className="text-(--color-gold)"
                    />

                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-text)">
                        Refine your search
                    </h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-(--color-text-soft)">
                            Price range
                        </label>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-xs text-(--color-text-muted)">
                                Min. price
                            </div>

                            <span className="text-xs text-(--color-text-soft)">
                                –
                            </span>

                            <div className="flex-1 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-xs text-(--color-text-muted)">
                                Max. price
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-(--color-text-soft)">
                            Product type
                        </label>

                        <div className="flex items-center justify-between rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-xs text-(--color-text-muted)">
                            All product types
                            <ChevronDown size={14} />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-(--color-text-soft)">
                            Availability
                        </label>

                        <div className="flex items-center justify-between rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-xs text-(--color-text-muted)">
                            All products
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-(--color-border) pt-4">
                <div className="mb-3 flex items-center gap-2">
                    <ArrowDownWideNarrow
                        size={14}
                        className="text-(--color-gold)"
                    />

                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-text)">
                        Sort by
                    </h3>
                </div>

                <div className="flex items-center justify-between rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-xs text-(--color-text-muted)">
                    Featured
                    <ChevronDown size={14} />
                </div>
            </div>

            <p className="text-[9px] leading-relaxed text-(--color-text-soft)">
                More ways to discover your favourites coming soon.
            </p>
        </div>
    );

    return (
        <>
            <WelcomeModal />

            <div className="w-full min-h-screen bg-(--color-background) text-(--color-text)">
                {/* =====================================================
                    MAIN CONTENT
                    ===================================================== */}

                <main className="relative z-30 flex w-full min-w-0 max-w-full flex-col gap-6">
                    {/* =================================================
                        FULL-WIDTH HERO BANNER
                        ================================================= */}

                    <div className="px-5 pt-1 sm:px-6">
                        <div className="relative mx-auto flex aspect-5/3.5 w-full max-w-full items-end overflow-hidden border border-(--color-border-strong) bg-black shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
                            {bannerSlides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                                        currentSlide === index
                                            ? 'z-10 scale-100 opacity-100'
                                            : 'pointer-events-none z-0 scale-105 opacity-0'
                                    }`}
                                >
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                        loading={
                                            index === 0
                                                ? 'eager'
                                                : 'lazy'
                                        }
                                    />

                                    <div className="absolute inset-0 z-10 bg-linear-to-t from-black via-black/55 to-black/10" />

                                    <div className="absolute inset-0 z-10 bg-linear-to-tr from-(--color-gold-dark)/25 via-transparent to-transparent" />
                                </div>
                            ))}

                            <div className="relative z-20 flex w-full flex-col items-center justify-end p-6 text-center sm:p-7">
                                <div className="mb-3 inline-flex w-max items-center gap-1.5 rounded-full border border-(--color-gold)/40 bg-black/50 px-3 py-1 text-xs font-semibold tracking-wide text-(--color-gold-light) backdrop-blur-md">
                                    {bannerSlides[currentSlide].tag}
                                </div>

                                <h2 className="mb-1 font-serif text-xl tracking-tight text-white drop-shadow-lg sm:text-2xl">
                                    {bannerSlides[currentSlide].title}
                                </h2>

                                <p className="max-w-xl font-sans text-xs text-white/85 drop-shadow-md sm:text-sm">
                                    {bannerSlides[currentSlide].subtitle}
                                </p>
                            </div>

                            <div className="pointer-events-auto absolute bottom-5 right-6 z-50 flex items-center gap-2">
                                {bannerSlides.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() =>
                                            setCurrentSlide(index)
                                        }
                                        className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                                            currentSlide === index
                                                ? 'w-7 bg-(--color-gold-light)'
                                                : 'w-2 bg-white/70 hover:bg-white'
                                        }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        MOBILE CATEGORY SELECTOR
                        ================================================= */}

                    <div className="px-5 sm:px-6 lg:hidden">
                        <div className="flex gap-1.5 overflow-x-auto rounded-lg border border-(--color-border-strong) bg-(--color-surface) p-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.18)]">
                            {catalogueTabs.map((tab) =>
                                renderCategoryButton(tab, true),
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        CATALOGUE LAYOUT
                        DESKTOP: 20% SIDEBAR / 80% PRODUCTS
                        MOBILE: STACKED
                        ================================================= */}

                    <section className="grid min-w-0 grid-cols-1 gap-6 px-5 pb-12 sm:px-6 lg:grid-cols-[minmax(220px,1fr)_minmax(0,4fr)] lg:items-start lg:gap-7">
                        {/* =================================================
                            DESKTOP STICKY SIDEBAR
                            ================================================= */}

                        <aside className="hidden min-w-0 lg:sticky lg:top-31 lg:block lg:self-start lg:pr-1">
                            <div className="max-h-none space-y-6 rounded-lg border border-(--color-border-strong) bg-(--color-surface-elevated)/95 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.2)] backdrop-blur-md lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto lg:overscroll-contain">
                                <div>
                                    <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.24em] text-(--color-gold)">
                                        Explore
                                    </p>

                                    <nav className="space-y-1">
                                        {catalogueTabs.map((tab) =>
                                            renderCategoryButton(tab),
                                        )}
                                    </nav>
                                </div>

                                <div className="border-t border-(--color-border) pt-5">
                                    <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.24em] text-(--color-gold)">
                                        Find something special
                                    </p>

                                    {renderSearch()}
                                </div>

                                <div className="border-t border-(--color-border) pt-5">
                                    {renderCatalogueControls()}
                                </div>
                            </div>
                        </aside>

                        {/* =================================================
                            PRODUCT CONTENT
                            ================================================= */}

                        <div className="min-w-0">
                            {/* MOBILE STICKY SEARCH */}

                            <div className="sticky top-26 z-40 -mx-5 mb-5 bg-(--color-background)/95 px-5 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.12)] backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:z-auto lg:mx-0 lg:mb-5 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none lg:backdrop-blur-none">
                                <div className="lg:hidden">
                                    {renderSearch()}
                                </div>
                            </div>

                            {/* SECTION HEADING */}

                            <div className="mb-5 flex flex-col justify-between gap-3 border-b border-(--color-border) pb-4 sm:flex-row sm:items-end">
                                <div>
                                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.24em] text-(--color-gold)">
                                        Glowa Vee Collection
                                    </p>

                                    <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-text) sm:text-3xl">
                                        {activeTabLabel}
                                    </h1>

                                    <p className="mt-1 text-xs text-(--color-text-muted)">
                                        {activeTab === 'products'
                                            ? 'Explore our beauty and skincare collection.'
                                            : activeTab === 'combos'
                                              ? 'Discover curated bundles and exclusive savings.'
                                              : 'Everything you need to start your reseller journey.'}
                                    </p>
                                </div>

                                <span className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-soft)">
                                    {displayedProductCount}
                                    {hasMoreProducts ? '+' : ''}{' '}
                                    {displayedProductCount === 1 &&
                                    !hasMoreProducts
                                        ? 'item'
                                        : 'items'}
                                </span>
                            </div>

                            {/* =================================================
                                LOADING / ERROR STATES
                                ================================================= */}

                            {activeTab !== 'resellers' &&
                            productsLoading ? (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className="w-full py-20 text-center text-sm text-(--color-gold-light) motion-safe:animate-pulse"
                                >
                                    Loading products...
                                </div>
                            ) : productsError &&
                              activeTab !== 'resellers' ? (
                                <div className="w-full py-20 text-center text-sm text-(--color-text-muted)">
                                    {productsError}
                                </div>
                            ) : visibleProducts.length > 0 ? (
                                /* =================================================
                                   PRODUCT GRID
                                   ================================================= */

                                <>
                                    <div className="grid max-w-full grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
                                        {visibleProducts.map(
                                            (product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex h-full flex-col *:h-full"
                                                >
                                                    <ProductCard
                                                        product={product}
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    {hasMoreProducts && (
                                        <div className="mt-10 flex flex-col items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={loadMoreProducts}
                                                disabled={loadingMore}
                                                className="inline-flex min-h-11 items-center justify-center border border-(--color-border-strong) bg-(--color-surface) px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-gold-light) transition-all hover:border-(--color-gold) hover:bg-(--color-gold)/6 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {loadingMore
                                                    ? 'Loading...'
                                                    : 'Load more products'}
                                            </button>

                                            {loadMoreError && (
                                                <p className="text-xs text-red-400">
                                                    {loadMoreError}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full py-20 text-center text-sm italic text-(--color-text-muted)">
                                    {activeTab === 'combos' &&
                                    !searchQuery.trim()
                                        ? 'No combos or specials are currently available.'
                                        : 'No products match your search.'}
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
