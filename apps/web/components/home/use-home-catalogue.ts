'use client';

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    PRODUCT_PAGE_SIZE,
    SEARCH_DEBOUNCE_MS,
    getCatalogueSection,
    resellerProducts,
} from './constants';

import type {
    CatalogueProduct,
    CatalogueResponse,
    CatalogueTab,
    Product,
} from './types';

import type { CatalogueSort } from './catalogue-sidebar';

export function useHomeCatalogue() {
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
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const [activeTab, setActiveTab] = useState<CatalogueTab>('products');

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState<CatalogueSort>('featured');

    const loadMoreControllerRef = useRef<AbortController | null>(null);
    const catalogueRequestIdRef = useRef(0);

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

    useEffect(() => {
        loadMoreControllerRef.current?.abort();
        loadMoreControllerRef.current = null;

        const section = getCatalogueSection(activeTab);

        setProducts([]);
        setNextCursor(null);
        setHasMoreProducts(false);
        setProductsError(null);
        setLoadMoreError(null);
        setLoadingMore(false);

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

                const data: CatalogueResponse = await response.json();

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
                if (
                    controller.signal.aborted ||
                    catalogueRequestIdRef.current !== requestId
                ) {
                    return;
                }

                console.error('Failed to load catalogue:', error);

                setProductsError(
                    'Unable to load products. Please try again.',
                );
            } finally {
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

            const data: CatalogueResponse = await response.json();

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

    const visibleProducts: CatalogueProduct[] =
        activeTab === 'resellers'
            ? filteredResellerProducts
            : products;

    const filteredProducts = useMemo(() => {
        const minimum = minPrice.trim() === ''
            ? null
            : Number(minPrice);

        const maximum = maxPrice.trim() === ''
            ? null
            : Number(maxPrice);

        const withinPriceRange = visibleProducts.filter((product) => {
            if (
                minimum !== null &&
                Number.isFinite(minimum) &&
                product.price < minimum
            ) {
                return false;
            }

            if (
                maximum !== null &&
                Number.isFinite(maximum) &&
                product.price > maximum
            ) {
                return false;
            }

            return true;
        });

        if (sortBy === 'featured') {
            return withinPriceRange;
        }

        return [...withinPriceRange].sort((a, b) => {
            if (sortBy === 'price-asc') {
                return a.price - b.price;
            }

            return b.price - a.price;
        });
    }, [visibleProducts, minPrice, maxPrice, sortBy]);

    const resetFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSortBy('featured');
    };

    return {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        visibleProducts: filteredProducts,
        productsLoading,
        loadingMore,
        productsError,
        loadMoreError,
        nextCursor,
        hasMoreProducts,
        loadMoreProducts,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        sortBy,
        setSortBy,
        resetFilters,
    };
}
