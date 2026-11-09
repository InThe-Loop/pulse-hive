import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

interface ProductsQuery {
    section?: string;
    limit?: string;
    cursor?: string;
    search?: string;
}

type CatalogueType =
    | 'PRODUCT'
    | 'COMBO_SPECIAL'
    | 'RESELLER_PACK';

interface ProductCursor {
    createdAt: string;
    id: string;
}

const DEFAULT_PAGE_SIZE = 9;
const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}

    async getProductsByTenantCode(
        tenantCode: string,
        query: ProductsQuery = {},
    ) {
        const normalizedCode = tenantCode.trim().toUpperCase();

        const tenant = await this.prisma.tenant.findUnique({
            where: {
                tenantCode: normalizedCode,
            },
            select: {
                id: true,
            },
        });

        if (!tenant) {
            throw new NotFoundException(
                `Tenant ${normalizedCode} was not found`,
            );
        }

        const hasCatalogueQuery = Object.values(query).some(
            (value) => value !== undefined,
        );

        const catalogueType = this.parseCatalogueType(query.section);
        const limit = this.parseLimit(query.limit);
        const search = this.parseSearch(query.search);
        const cursor = this.parseCursor(query.cursor);

        const where: any = {
            tenantId: tenant.id,
            status: 'ACTIVE',
            AND: [],
        };

        if (catalogueType) {
            where.catalogueType = catalogueType;
        }

        if (search) {
            where.AND.push({
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        sku: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
            });
        }

        if (cursor) {
            where.AND.push({
                OR: [
                    {
                        createdAt: {
                            gt: new Date(cursor.createdAt),
                        },
                    },
                    {
                        createdAt: new Date(cursor.createdAt),
                        id: {
                            gt: cursor.id,
                        },
                    },
                ],
            });
        }

        const products = await this.prisma.product.findMany({
            where,
            orderBy: [
                {
                    createdAt: 'asc',
                },
                {
                    id: 'asc',
                },
            ],
            take: hasCatalogueQuery ? limit + 1 : undefined,
            select: {
                id: true,
                tenantId: true,
                name: true,
                description: true,
                sku: true,
                image: true,
                size: true,
                price: true,
                catalogueType: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!hasCatalogueQuery) {
            return products.map((product) => this.formatProduct(product));
        }

        const hasMore = products.length > limit;
        const pageProducts = hasMore
            ? products.slice(0, limit)
            : products;

        const lastProduct = pageProducts[pageProducts.length - 1];

        return {
            items: pageProducts.map((product) => this.formatProduct(product)),
            pageInfo: {
                limit,
                hasMore,
                nextCursor: hasMore && lastProduct
                    ? this.createCursor(lastProduct)
                    : null,
            },
        };
    }

    private parseCatalogueType(
        section?: string,
    ): CatalogueType | undefined {
        if (section === undefined) {
            return undefined;
        }

        const normalizedSection = section.trim().toUpperCase();

        const validSections: CatalogueType[] = [
            'PRODUCT',
            'COMBO_SPECIAL',
            'RESELLER_PACK',
        ];

        if (!validSections.includes(normalizedSection as CatalogueType)) {
            throw new BadRequestException(
                `Invalid catalogue section: ${section}`,
            );
        }

        return normalizedSection as CatalogueType;
    }

    private parseLimit(limit?: string): number {
        if (limit === undefined) {
            return DEFAULT_PAGE_SIZE;
        }

        const parsedLimit = Number(limit);

        if (
            !Number.isInteger(parsedLimit)
            || parsedLimit < 1
        ) {
            throw new BadRequestException(
                'Limit must be a positive integer',
            );
        }

        return Math.min(parsedLimit, MAX_PAGE_SIZE);
    }

    private parseSearch(search?: string): string | undefined {
        const normalizedSearch = search?.trim();

        if (!normalizedSearch) {
            return undefined;
        }

        if (normalizedSearch.length > MAX_SEARCH_LENGTH) {
            throw new BadRequestException(
                `Search cannot exceed ${MAX_SEARCH_LENGTH} characters`,
            );
        }

        return normalizedSearch;
    }

    private parseCursor(cursor?: string): ProductCursor | undefined {
        if (cursor === undefined) {
            return undefined;
        }

        try {
            const decoded = Buffer
                .from(cursor, 'base64url')
                .toString('utf8');

            const parsed = JSON.parse(decoded) as ProductCursor;

            if (
                typeof parsed.id !== 'string'
                || !parsed.id
                || typeof parsed.createdAt !== 'string'
                || Number.isNaN(Date.parse(parsed.createdAt))
            ) {
                throw new Error('Invalid cursor payload');
            }

            return parsed;
        } catch {
            throw new BadRequestException(
                'Invalid pagination cursor',
            );
        }
    }

    private createCursor(product: {
        id: string;
        createdAt: Date;
    }): string {
        const cursor: ProductCursor = {
            id: product.id,
            createdAt: product.createdAt.toISOString(),
        };

        return Buffer
            .from(JSON.stringify(cursor))
            .toString('base64url');
    }

    private formatProduct(product: any) {
        return {
            ...product,
            price: Number(product.price),
            active: product.status === 'ACTIVE',
        };
    }
}
