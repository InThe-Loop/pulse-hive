import { NextResponse } from 'next/server';

const TENANT_CODE = process.env.PULSEHIVE_TENANT_CODE;
const DB_SERVICE_URL = process.env.PULSEHIVE_DB_SERVICE_URL;

const CATALOGUE_QUERY_PARAMS = [
    'section',
    'search',
    'limit',
    'cursor',
] as const;

export async function GET(request: Request) {
    if (!TENANT_CODE) {
        return NextResponse.json(
            {
                error: 'PULSEHIVE_TENANT_CODE is not configured',
            },
            { status: 500 },
        );
    }

    if (!DB_SERVICE_URL) {
        return NextResponse.json(
            {
                error: 'PULSEHIVE_DB_SERVICE_URL is not configured',
            },
            { status: 500 },
        );
    }

    try {
        const requestUrl = new URL(request.url);
        const queryParams = new URLSearchParams();

        for (const param of CATALOGUE_QUERY_PARAMS) {
            const value = requestUrl.searchParams.get(param);

            if (value !== null) {
                queryParams.set(param, value);
            }
        }

        const queryString = queryParams.toString();
        const productsUrl =
            `${DB_SERVICE_URL.replace(/\/+$/, '')}` +
            `/products/tenant/${encodeURIComponent(TENANT_CODE)}` +
            (queryString ? `?${queryString}` : '');

        const response = await fetch(productsUrl, {
            headers: {
                Accept: 'application/json',
                'x-internal-service-key':
                    process.env.INTERNAL_SERVICE_KEY ?? '',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();

            console.error(
                'Failed to fetch products from DB service:',
                response.status,
                errorText,
            );

            return NextResponse.json(
                {
                    error: 'Failed to fetch products',
                },
                { status: response.status },
            );
        }

        const products = await response.json();

        return NextResponse.json(products);
    } catch (error) {
        console.error(
            'Unable to reach PulseHive DB service:',
            error,
        );

        return NextResponse.json(
            {
                error: 'Unable to reach product service',
            },
            { status: 503 },
        );
    }
}
