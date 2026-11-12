'use client';

import {
    ArrowDownWideNarrow,
    ChevronDown,
    Filter,
    RotateCcw,
    Search,
} from 'lucide-react';

import { catalogueTabs } from './constants';

import type { CatalogueTab } from './types';

export type CatalogueSort =
    | 'featured'
    | 'price-asc'
    | 'price-desc';

type CatalogueSidebarProps = {
    activeTab: CatalogueTab;
    searchQuery: string;
    minPrice: string;
    maxPrice: string;
    sortBy: CatalogueSort;
    onTabChange: (tab: CatalogueTab) => void;
    onSearchChange: (value: string) => void;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    onSortChange: (value: CatalogueSort) => void;
    onResetFilters: () => void;
};

function CategoryButton({
    tab,
    active,
    compact = false,
    onClick,
}: {
    tab: (typeof catalogueTabs)[number];
    active: boolean;
    compact?: boolean;
    onClick: () => void;
}) {
    const Icon = tab.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`flex items-center gap-3 rounded-md border text-left transition-all duration-200 ${
                compact
                    ? 'min-w-max flex-1 justify-center px-3 py-3 text-xs'
                    : 'w-full px-3.5 py-3 text-sm'
            } ${
                active
                    ? 'border-(--color-gold)/60 bg-(--color-gold)/10 text-(--color-gold-light) shadow-[0_4px_18px_rgba(216,181,109,0.07)]'
                    : 'border-transparent text-(--color-text-soft) hover:border-(--color-border) hover:bg-white/2.5 hover:text-(--color-text)'
            }`}
        >
            <Icon
                size={compact ? 15 : 17}
                className={active ? 'shrink-0 text-(--color-gold)' : 'shrink-0'}
            />

            <span className="whitespace-nowrap font-medium">
                {tab.label}
            </span>

            {!compact && active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-(--color-gold)" />
            )}
        </button>
    );
}

export function CatalogueSearch({
    activeTab,
    searchQuery,
    onSearchChange,
}: Pick<
    CatalogueSidebarProps,
    'activeTab' | 'searchQuery' | 'onSearchChange'
>) {
    return (
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
                onChange={(event) => onSearchChange(event.target.value)}
                value={searchQuery}
            />
        </div>
    );
}

function CatalogueControls({
    minPrice,
    maxPrice,
    sortBy,
    onMinPriceChange,
    onMaxPriceChange,
    onSortChange,
    onResetFilters,
}: Pick<
    CatalogueSidebarProps,
    | 'minPrice'
    | 'maxPrice'
    | 'sortBy'
    | 'onMinPriceChange'
    | 'onMaxPriceChange'
    | 'onSortChange'
    | 'onResetFilters'
>) {
    return (
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

                <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-(--color-text-soft)">
                        Price range
                    </label>

                    <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                            <label
                                htmlFor="catalogue-min-price"
                                className="sr-only"
                            >
                                Minimum price
                            </label>

                            <input
                                id="catalogue-min-price"
                                type="number"
                                min="0"
                                step="1"
                                inputMode="numeric"
                                placeholder="Min. price"
                                value={minPrice}
                                onChange={(event) =>
                                    onMinPriceChange(event.target.value)
                                }
                                className="w-full min-w-0 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-xs text-(--color-text) placeholder:text-(--color-text-muted) focus:border-(--color-gold)/50 focus:outline-none focus:ring-2 focus:ring-(--color-gold)/20"
                            />
                        </div>

                        <span className="text-xs text-(--color-text-soft)">
                            –
                        </span>

                        <div className="min-w-0 flex-1">
                            <label
                                htmlFor="catalogue-max-price"
                                className="sr-only"
                            >
                                Maximum price
                            </label>

                            <input
                                id="catalogue-max-price"
                                type="number"
                                min="0"
                                step="1"
                                inputMode="numeric"
                                placeholder="Max. price"
                                value={maxPrice}
                                onChange={(event) =>
                                    onMaxPriceChange(event.target.value)
                                }
                                className="w-full min-w-0 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-xs text-(--color-text) placeholder:text-(--color-text-muted) focus:border-(--color-gold)/50 focus:outline-none focus:ring-2 focus:ring-(--color-gold)/20"
                            />
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

                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(event) =>
                            onSortChange(event.target.value as CatalogueSort)
                        }
                        className="w-full appearance-none rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2.5 pr-9 text-xs text-(--color-text) focus:border-(--color-gold)/50 focus:outline-none focus:ring-2 focus:ring-(--color-gold)/20"
                    >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: low to high</option>
                        <option value="price-desc">Price: high to low</option>
                    </select>

                    <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={onResetFilters}
                className="flex w-full items-center justify-center gap-2 border border-(--color-border) px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-text-soft) transition-colors hover:border-(--color-gold)/40 hover:text-(--color-gold-light)"
            >
                <RotateCcw size={13} />
                Reset filters
            </button>

            <p className="text-[9px] leading-relaxed text-(--color-text-soft)">
                Price filters and sorting apply to the products currently loaded.
            </p>
        </div>
    );
}

export function CatalogueMobileTabs({
    activeTab,
    onTabChange,
}: Pick<CatalogueSidebarProps, 'activeTab' | 'onTabChange'>) {
    return (
        <div className="px-5 sm:px-6 lg:hidden">
            <div className="flex gap-1.5 overflow-x-auto rounded-lg border border-(--color-border-strong) bg-(--color-surface) p-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.18)]">
                {catalogueTabs.map((tab) => (
                    <CategoryButton
                        key={tab.id}
                        tab={tab}
                        active={activeTab === tab.id}
                        compact
                        onClick={() => onTabChange(tab.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export function CatalogueSidebar({
    activeTab,
    searchQuery,
    minPrice,
    maxPrice,
    sortBy,
    onTabChange,
    onSearchChange,
    onMinPriceChange,
    onMaxPriceChange,
    onSortChange,
    onResetFilters,
}: CatalogueSidebarProps) {
    return (
        <aside className="hidden min-w-0 lg:sticky lg:top-31 lg:block lg:self-start lg:pr-1">
            <div className="scroll-area max-h-none space-y-6 border border-(--color-border-strong) bg-(--color-surface-elevated)/95 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.2)] backdrop-blur-md lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto lg:overscroll-contain">
                <div>
                    <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.24em] text-(--color-gold)">
                        Explore
                    </p>

                    <nav className="space-y-1">
                        {catalogueTabs.map((tab) => (
                            <CategoryButton
                                key={tab.id}
                                tab={tab}
                                active={activeTab === tab.id}
                                onClick={() => onTabChange(tab.id)}
                            />
                        ))}
                    </nav>
                </div>

                <div className="border-t border-(--color-border) pt-5">
                    <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.24em] text-(--color-gold)">
                        Find something special
                    </p>

                    <CatalogueSearch
                        activeTab={activeTab}
                        searchQuery={searchQuery}
                        onSearchChange={onSearchChange}
                    />
                </div>

                <div className="border-t border-(--color-border) pt-5">
                    <CatalogueControls
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        sortBy={sortBy}
                        onMinPriceChange={onMinPriceChange}
                        onMaxPriceChange={onMaxPriceChange}
                        onSortChange={onSortChange}
                        onResetFilters={onResetFilters}
                    />
                </div>
            </div>
        </aside>
    );
}
