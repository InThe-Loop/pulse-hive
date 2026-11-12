'use client';

import { ProductCard } from '@/components/product-card';

import { CatalogueSearch } from './catalogue-sidebar';
import { catalogueTabs } from './constants';

import type {
    CatalogueProduct,
    CatalogueTab,
} from './types';

type CatalogueResultsProps = {
    activeTab: CatalogueTab;
    searchQuery: string;
    products: CatalogueProduct[];
    productsLoading: boolean;
    productsError: string | null;
    loadMoreError: string | null;
    loadingMore: boolean;
    hasMoreProducts: boolean;
    onSearchChange: (value: string) => void;
    onLoadMore: () => void;
};

export function CatalogueResults({
    activeTab,
    searchQuery,
    products,
    productsLoading,
    productsError,
    loadMoreError,
    loadingMore,
    hasMoreProducts,
    onSearchChange,
    onLoadMore,
}: CatalogueResultsProps) {
    const displayedProductCount = products.length;

    const activeTabLabel =
        catalogueTabs.find((tab) => tab.id === activeTab)?.label ??
        'Products';

    return (
        <div className="min-w-0">
            {/* Mobile sticky search */}
            <div className="sticky top-26 z-40 -mx-5 mb-5 bg-(--color-background)/95 px-5 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.12)] backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:z-auto lg:mx-0 lg:mb-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none lg:backdrop-blur-none">
                <div className="lg:hidden">
                    <CatalogueSearch
                        activeTab={activeTab}
                        searchQuery={searchQuery}
                        onSearchChange={onSearchChange}
                    />
                </div>
            </div>

            {/* Section heading */}
            <div className="relative mb-6 overflow-hidden border border-(--color-border-strong) bg-[radial-gradient(ellipse_at_top_right,rgba(198,160,83,0.13),transparent_48%),linear-gradient(135deg,#1c1913_0%,#11100e_58%,#0b0b0a_100%)] px-6 py-8 sm:px-10 sm:py-9">
                <div className="absolute inset-x-0 top-0 h-px gold-foil" />

                <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-(--color-gold)/10" />
                <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full border border-(--color-gold)/10" />

                <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-(--color-gold-light)">
                            Glowa Vee Collection
                        </p>

                        <h1 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-3xl">
                            {activeTabLabel}
                        </h1>

                        <p className="mt-3 max-w-xl font-body text-xs leading-6 text-white/60 sm:text-sm">
                            {activeTab === 'products'
                                ? 'Explore our beauty and skincare collection.'
                                : activeTab === 'combos'
                                    ? 'Discover curated bundles and exclusive savings.'
                                    : 'Everything you need to start your reseller journey.'}
                        </p>
                    </div>

                    <span className="shrink-0 font-body text-[10px] font-semibold uppercase tracking-wider text-(--color-gold-light)">
                        {displayedProductCount}
                        {hasMoreProducts ? '+' : ''}{' '}
                        {displayedProductCount === 1 && !hasMoreProducts
                            ? 'item'
                            : 'items'}
                    </span>
                </div>
            </div>

            {/* Loading / error / products */}
            {activeTab !== 'resellers' && productsLoading ? (
                <div
                    role="status"
                    aria-live="polite"
                    className="w-full py-20 text-center text-sm text-(--color-gold-light) motion-safe:animate-pulse"
                >
                    Loading products...
                </div>
            ) : productsError && activeTab !== 'resellers' ? (
                <div className="w-full py-20 text-center text-sm text-(--color-text-muted)">
                    {productsError}
                </div>
            ) : products.length > 0 ? (
                <>
                    {/* Product grid */}
                    <div className="grid max-w-full grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="flex h-full flex-col *:h-full"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    {hasMoreProducts && (
                        <div className="mt-10 flex flex-col items-center gap-3">
                            <button
                                type="button"
                                onClick={onLoadMore}
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
                    {activeTab === 'combos' && !searchQuery.trim()
                        ? 'No combos or specials are currently available.'
                        : 'No products match your search.'}
                </div>
            )}
        </div>
    );
}
