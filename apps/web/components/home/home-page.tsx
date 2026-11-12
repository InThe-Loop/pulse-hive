'use client';

import { WelcomeModal } from '@/components/welcome-modal';

import {
    CatalogueMobileTabs,
    CatalogueSidebar,
} from './catalogue-sidebar';

import { CatalogueResults } from './catalogue-results';
import { HomeHero } from './home-hero';
import { useHomeCatalogue } from './use-home-catalogue';

export default function HomePage() {
    const {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        visibleProducts,
        productsLoading,
        loadingMore,
        productsError,
        loadMoreError,
        hasMoreProducts,
        loadMoreProducts,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        sortBy,
        setSortBy,
        resetFilters,
    } = useHomeCatalogue();

    const handleTabChange = (
        tab: typeof activeTab,
    ) => {
        setActiveTab(tab);
        setSearchQuery('');
        resetFilters();
    };

    return (
        <>
            <WelcomeModal />

            <div className="w-full min-h-screen bg-(--color-background) text-(--color-text)">
                <main className="relative z-30 flex w-full min-w-0 max-w-full flex-col gap-6">
                    <HomeHero />

                    <CatalogueMobileTabs
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />

                    <section className="mx-auto grid w-full max-w-360 min-w-0 grid-cols-1 gap-6 px-5 pb-12 sm:px-6 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.65fr)] lg:items-start">
                        <CatalogueSidebar
                            activeTab={activeTab}
                            searchQuery={searchQuery}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            sortBy={sortBy}
                            onTabChange={handleTabChange}
                            onSearchChange={setSearchQuery}
                            onMinPriceChange={setMinPrice}
                            onMaxPriceChange={setMaxPrice}
                            onSortChange={setSortBy}
                            onResetFilters={resetFilters}
                        />

                        <CatalogueResults
                            activeTab={activeTab}
                            searchQuery={searchQuery}
                            products={visibleProducts}
                            productsLoading={productsLoading}
                            productsError={productsError}
                            loadMoreError={loadMoreError}
                            loadingMore={loadingMore}
                            hasMoreProducts={hasMoreProducts}
                            onSearchChange={setSearchQuery}
                            onLoadMore={loadMoreProducts}
                        />
                    </section>
                </main>
            </div>
        </>
    );
}
