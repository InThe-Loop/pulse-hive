import { randomUUID } from 'node:crypto';

import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    OrderStatus,
    PaymentProvider,
    PaymentStatus,
    Prisma,
} from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { CreatePendingOrderDto } from '../dto/create-pending-order.dto';

@Injectable()
export class OrderCreationService {
    constructor(private readonly prisma: PrismaService) {}

    async createPendingOrder(
        input: CreatePendingOrderDto,
    ) {
        /*
         * Validate the request shape before accessing nested fields.
         * TypeScript DTO declarations alone do not validate HTTP input.
         */
        if (
            !input ||
            typeof input !== 'object'
        ) {
            throw new BadRequestException(
                'A valid order payload is required',
            );
        }

        if (
            typeof input.idempotencyKey !== 'string' ||
            !/^[0-9a-f-]{36}$/i.test(input.idempotencyKey)
        ) {
            throw new BadRequestException(
                'A valid checkout idempotency key is required.',
            );
        }

        if (!Array.isArray(input.items)) {
            throw new BadRequestException(
                'A valid order payload is required',
            );
        }

        if (
            input.items.length < 1 ||
            input.items.length > 100
        ) {
            throw new BadRequestException(
                'An order must contain between 1 and 100 items',
            );
        }

        if (
            typeof input.tenantId !== 'string' ||
            !input.tenantId.trim()
        ) {
            throw new BadRequestException(
                'Tenant ID is required',
            );
        }

        if (
            typeof input.customerName !== 'string' ||
            !input.customerName.trim() ||
            input.customerName.trim().length > 150
        ) {
            throw new BadRequestException(
                'A valid customer name is required',
            );
        }

        if (
            typeof input.phoneNumber !== 'string' ||
            !input.phoneNumber.trim() ||
            input.phoneNumber.trim().length > 30
        ) {
            throw new BadRequestException(
                'A valid phone number is required',
            );
        }

        if (
            typeof input.deliveryAddress !== 'string' ||
            !input.deliveryAddress.trim() ||
            input.deliveryAddress.trim().length > 500
        ) {
            throw new BadRequestException(
                'A valid delivery address is required',
            );
        }

        if (
            typeof input.shippingMethod !== 'string' ||
            !input.shippingMethod.trim() ||
            input.shippingMethod.trim().length > 100
        ) {
            throw new BadRequestException(
                'A valid shipping method is required',
            );
        }

        if (
            typeof input.transactionReference !== 'string' ||
            !input.transactionReference.trim() ||
            input.transactionReference.trim().length > 150
        ) {
            throw new BadRequestException(
                'A valid transaction reference is required',
            );
        }

        if (input.provider !== PaymentProvider.OZOW) {
            throw new BadRequestException(
                'Only Ozow is supported for this checkout',
            );
        }

        /*
         * Convert monetary values to integer cents.
         * Never use floating-point arithmetic to compare totals.
         */
        const toCents = (
            value: unknown,
            field: string,
            allowZero = true,
        ): number => {
            if (
                typeof value !== 'number' ||
                !Number.isFinite(value) ||
                value < 0 ||
                (!allowZero && value === 0)
            ) {
                throw new BadRequestException(
                    `${field} is invalid`,
                );
            }

            const cents = Math.round(value * 100);

            if (
                !Number.isSafeInteger(cents) ||
                Math.abs(value * 100 - cents) > 0.000001
            ) {
                throw new BadRequestException(
                    `${field} must be a valid amount in cents`,
                );
            }

            return cents;
        };

        const shippingFeeCents = toCents(
            input.shippingFee,
            'Shipping fee',
        );

        const submittedSubtotalCents = toCents(
            input.subtotal,
            'Subtotal',
            false,
        );

        const submittedTotalCents = toCents(
            input.totalAmount,
            'Order total',
            false,
        );

        /*
         * Resolve the tenant before looking up its products.
         */
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                id: input.tenantId,
            },
        });

        if (!tenant) {
            throw new NotFoundException(
                `Tenant ${input.tenantId} not found`,
            );
        }

        /*
         * The request must identify real product records.
         * Client-provided names, SKUs and prices are not trusted.
         */
        const requestedItems = input.items.map((item) => {
            if (
                !item ||
                typeof item !== 'object' ||
                typeof item.productId !== 'string' ||
                !item.productId.trim()
            ) {
                throw new BadRequestException(
                    'Every order item must have a product ID',
                );
            }

            if (
                !Number.isSafeInteger(item.quantity) ||
                item.quantity < 1 ||
                item.quantity > 10000
            ) {
                throw new BadRequestException(
                    'Each item must have a valid quantity',
                );
            }

            return {
                productId: item.productId.trim(),
                quantity: item.quantity,
            };
        });

        const productIds = [
            ...new Set(
                requestedItems.map((item) => item.productId),
            ),
        ];

        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
                tenantId: tenant.id,
                active: true,
            },
            select: {
                id: true,
                name: true,
                sku: true,
                price: true,
            },
        });

        const productsById = new Map(
            products.map((product) => [
                product.id,
                product,
            ]),
        );

        if (productsById.size !== productIds.length) {
            throw new BadRequestException(
                'One or more products are unavailable for this tenant',
            );
        }

        /*
         * Build order lines exclusively from database product data.
         */
        let verifiedSubtotalCents = 0;

        const verifiedItems = requestedItems.map((item) => {
            const product = productsById.get(item.productId);

            if (!product) {
                throw new BadRequestException(
                    'An order product could not be verified',
                );
            }

            const unitPriceCents = toCents(
                Number(product.price),
                `Price for ${product.name}`,
                false,
            );

            const lineTotalCents =
                unitPriceCents * item.quantity;

            if (!Number.isSafeInteger(lineTotalCents)) {
                throw new BadRequestException(
                    'An item total exceeds the supported amount',
                );
            }

            verifiedSubtotalCents += lineTotalCents;

            if (
                !Number.isSafeInteger(verifiedSubtotalCents)
            ) {
                throw new BadRequestException(
                    'Order subtotal exceeds the supported amount',
                );
            }

            return {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                quantity: item.quantity,
                unitPriceCents,
                lineTotalCents,
            };
        });

        if (
            submittedSubtotalCents !== verifiedSubtotalCents
        ) {
            throw new BadRequestException(
                'Submitted subtotal does not match verified product prices',
            );
        }

        const verifiedTotalCents =
            verifiedSubtotalCents + shippingFeeCents;

        if (
            !Number.isSafeInteger(verifiedTotalCents) ||
            verifiedTotalCents <= 0
        ) {
            throw new BadRequestException(
                'Calculated order total is invalid',
            );
        }

        if (submittedTotalCents !== verifiedTotalCents) {
            throw new BadRequestException(
                'Submitted total does not match the verified subtotal and shipping fee',
            );
        }

        /*
         * Use a UUID-based reference instead of Date.now(),
         * which can collide when requests arrive concurrently.
         */
        const orderReference = `ORD-${randomUUID()}`;

        /*
         * Recheck the product records inside the transaction so a
         * product deactivated or repriced after initial validation
         * cannot silently be sold using stale prices.
         */
        const result = await this.prisma.$transaction(
            async (tx) => {
                const currentProducts =
                    await tx.product.findMany({
                        where: {
                            id: {
                                in: productIds,
                            },
                            tenantId: tenant.id,
                            active: true,
                        },
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                            price: true,
                        },
                    });

                const currentProductsById = new Map(
                    currentProducts.map((product) => [
                        product.id,
                        product,
                    ]),
                );

                if (
                    currentProductsById.size !== productIds.length
                ) {
                    throw new BadRequestException(
                        'One or more products are no longer available',
                    );
                }

                const transactionItems = requestedItems.map(
                    (item) => {
                        const product =
                            currentProductsById.get(
                                item.productId,
                            );

                        if (!product) {
                            throw new BadRequestException(
                                'An order product could not be verified',
                            );
                        }

                        const unitPriceCents = toCents(
                            Number(product.price),
                            `Price for ${product.name}`,
                            false,
                        );

                        const originalItem =
                            verifiedItems.find(
                                (verified) =>
                                    verified.productId ===
                                    item.productId,
                            );

                        /*
                         * Duplicate product IDs are allowed as
                         * separate lines, but all lines must use
                         * the same current database price.
                         */
                        if (
                            !originalItem ||
                            originalItem.unitPriceCents !==
                                unitPriceCents ||
                            originalItem.productName !==
                                product.name
                        ) {
                            throw new BadRequestException(
                                'Product details changed during checkout; please retry',
                            );
                        }

                        const lineTotalCents =
                            unitPriceCents * item.quantity;

                        if (
                            !Number.isSafeInteger(lineTotalCents)
                        ) {
                            throw new BadRequestException(
                                'An item total is invalid',
                            );
                        }

                        return {
                            productId: product.id,
                            productName: product.name,
                            sku: product.sku,
                            quantity: item.quantity,
                            unitPrice: new Prisma.Decimal(
                                (unitPriceCents / 100).toFixed(2),
                            ),
                            totalPrice: new Prisma.Decimal(
                                (lineTotalCents / 100).toFixed(2),
                            ),
                        };
                    },
                );

                const currentSubtotalCents =
                    transactionItems.reduce(
                        (sum, item) =>
                            sum +
                            Math.round(
                                Number(item.totalPrice) * 100,
                            ),
                        0,
                    );

                if (
                    !Number.isSafeInteger(currentSubtotalCents) ||
                    currentSubtotalCents !==
                        submittedSubtotalCents
                ) {
                    throw new BadRequestException(
                        'Product prices changed during checkout; please retry',
                    );
                }

                let customer = await tx.customer.findFirst({
                    where: {
                        tenantId: tenant.id,
                        phone: input.phoneNumber.trim(),
                    },
                });

                if (!customer) {
                    customer = await tx.customer.create({
                        data: {
                            tenantId: tenant.id,
                            name: input.customerName.trim(),
                            phone: input.phoneNumber.trim(),
                            address: input.deliveryAddress.trim(),
                        },
                    });
                } else {
                    customer = await tx.customer.update({
                        where: {
                            id: customer.id,
                        },
                        data: {
                            name: input.customerName.trim(),
                            address: input.deliveryAddress.trim(),
                        },
                    });
                }

                const order = await tx.order.create({
                    data: {
                        tenantId: tenant.id,
                        reference: orderReference,
                        customerId: customer.id,

                        status: OrderStatus.PENDING_PAYMENT,
                        paymentStatus: PaymentStatus.PENDING,

                        subtotal: new Prisma.Decimal(
                            (currentSubtotalCents / 100).toFixed(2),
                        ),
                        shippingFee: new Prisma.Decimal(
                            (shippingFeeCents / 100).toFixed(2),
                        ),
                        totalAmount: new Prisma.Decimal(
                            (verifiedTotalCents / 100).toFixed(2),
                        ),

                        idempotencyKey:
                            input.idempotencyKey,
                        shippingMethod:
                            input.shippingMethod.trim(),
                        deliveryAddress:
                            input.deliveryAddress.trim(),

                        items: {
                            create: transactionItems,
                        },
                    },
                });

                const payment = await tx.payment.create({
                    data: {
                        tenantId: tenant.id,
                        orderId: order.id,

                        provider: PaymentProvider.OZOW,
                        status: PaymentStatus.PENDING,

                        amount: new Prisma.Decimal(
                            (verifiedTotalCents / 100).toFixed(2),
                        ),
                        currency: 'ZAR',

                        transactionReference:
                            input.transactionReference.trim(),
                        customerName: input.customerName.trim(),
                    },
                });

                return {
                    order,
                    payment,
                };
            },
        );

        return {
            status: 'pending',
            orderId: result.order.id,
            orderReference: result.order.reference,
            paymentId: result.payment.id,
            transactionReference:
                result.payment.transactionReference,
            amount: result.payment.amount.toString(),
            currency: result.payment.currency,
        };
    }
}
