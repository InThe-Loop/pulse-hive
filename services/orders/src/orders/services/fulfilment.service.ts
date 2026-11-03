import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    FulfilmentStatus,
    Prisma,
} from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { UpdateFulfilmentDto } from '../dto/update-fulfilment.dto';

const ALLOWED_TRANSITIONS: Record<
    FulfilmentStatus,
    FulfilmentStatus[]
> = {
    NOT_STARTED: [
        FulfilmentStatus.PROCESSING,
        FulfilmentStatus.ON_HOLD,
    ],
    PROCESSING: [
        FulfilmentStatus.PACKED,
        FulfilmentStatus.ON_HOLD,
    ],
    PACKED: [
        FulfilmentStatus.READY_FOR_DISPATCH,
        FulfilmentStatus.ON_HOLD,
    ],
    READY_FOR_DISPATCH: [
        FulfilmentStatus.DISPATCHED,
        FulfilmentStatus.ON_HOLD,
    ],
    DISPATCHED: [
        FulfilmentStatus.DELIVERED,
        FulfilmentStatus.DELIVERY_FAILED,
        FulfilmentStatus.ON_HOLD,
    ],
    ON_HOLD: [
        FulfilmentStatus.PROCESSING,
    ],
    DELIVERY_FAILED: [
        FulfilmentStatus.PROCESSING,
    ],
    DELIVERED: [],
};

const MAX_TRANSACTION_ATTEMPTS = 3;

@Injectable()
export class FulfilmentService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async updateFulfilment(
        tenantId: string,
        orderId: string,
        actorUserId: string | undefined,
        input: UpdateFulfilmentDto,
    ) {
        const authenticatedTenantId = tenantId?.trim();
        const authenticatedActorId = actorUserId?.trim();

        if (!authenticatedTenantId) {
            throw new BadRequestException(
                'Authenticated tenant context is required',
            );
        }

        if (!authenticatedActorId) {
            throw new BadRequestException(
                'Authenticated user identity is required for fulfilment auditing',
            );
        }

        if (!orderId?.trim()) {
            throw new BadRequestException(
                'Order ID is required',
            );
        }

        if (!input) {
            throw new BadRequestException(
                'Fulfilment update payload is required',
            );
        }

        for (
            let attempt = 1;
            attempt <= MAX_TRANSACTION_ATTEMPTS;
            attempt += 1
        ) {
            try {
                return await this.prisma.$transaction(
                    async (tx) => {
                        const order = await tx.order.findFirst({
                            where: {
                                id: orderId,
                                tenantId: authenticatedTenantId,
                            },
                            select: {
                                id: true,
                            },
                        });

                        if (!order) {
                            throw new NotFoundException(
                                'Order not found',
                            );
                        }

                        let fulfilment =
                            await tx.orderFulfilment.findUnique({
                                where: {
                                    orderId: order.id,
                                },
                            });

                        if (!fulfilment) {
                            fulfilment =
                                await tx.orderFulfilment.create({
                                    data: {
                                        orderId: order.id,
                                        status:
                                            FulfilmentStatus.NOT_STARTED,
                                    },
                                });
                        }

                        const previousStatus = fulfilment.status;
                        const nextStatus = input.status;
                        const statusChanged = previousStatus !== nextStatus;
                        const hasDeliveryMetadata =
                            input.deliveryProvider !== undefined ||
                            input.trackingReference !== undefined ||
                            input.operationalNotes !== undefined;

                        // Same-status updates are permitted only for delivery metadata.
                        // This lets the admin edit carrier/tracking/notes without
                        // advancing the fulfilment lifecycle or resetting timestamps.
                        if (
                            statusChanged &&
                            !ALLOWED_TRANSITIONS[previousStatus].includes(nextStatus)
                        ) {
                            throw new BadRequestException(
                                `Invalid fulfilment transition: ${previousStatus} -> ${nextStatus}`,
                            );
                        }

                        if (!statusChanged && !hasDeliveryMetadata) {
                            throw new BadRequestException(
                                'Provide delivery details to update without changing fulfilment status',
                            );
                        }

                        const now = new Date();
                        const resetProcessingTimestamps =
                            statusChanged &&
                            nextStatus === FulfilmentStatus.PROCESSING;

                        const updated =
                            await tx.orderFulfilment.update({
                                where: {
                                    orderId: order.id,
                                },
                                data: {
                                    status: nextStatus,

                                    ...(input.deliveryProvider !== undefined
                                        ? {
                                            deliveryProvider:
                                                input.deliveryProvider,
                                        }
                                        : {}),

                                    ...(input.trackingReference !== undefined
                                        ? {
                                            trackingReference:
                                                input.trackingReference,
                                        }
                                        : {}),

                                    ...(input.operationalNotes !== undefined
                                        ? {
                                            operationalNotes:
                                                input.operationalNotes,
                                        }
                                        : {}),

                                    ...(resetProcessingTimestamps
                                        ? {
                                            startedAt: now,
                                            packedAt: null,
                                            readyForDispatchAt: null,
                                            dispatchedAt: null,
                                            deliveredAt: null,
                                        }
                                        : {}),

                                    ...(statusChanged && nextStatus === FulfilmentStatus.PACKED
                                        ? {
                                            packedAt: now,
                                            readyForDispatchAt: null,
                                            dispatchedAt: null,
                                            deliveredAt: null,
                                        }
                                        : {}),

                                    ...(statusChanged && nextStatus === FulfilmentStatus.READY_FOR_DISPATCH
                                        ? {
                                            readyForDispatchAt: now,
                                            dispatchedAt: null,
                                            deliveredAt: null,
                                        }
                                        : {}),

                                    ...(statusChanged && nextStatus === FulfilmentStatus.DISPATCHED
                                        ? {
                                            dispatchedAt: now,
                                            deliveredAt: null,
                                        }
                                        : {}),

                                    ...(statusChanged && nextStatus === FulfilmentStatus.DELIVERED
                                        ? {
                                            deliveredAt: now,
                                        }
                                        : {}),
                                },
                            });

                        await tx.orderFulfilmentHistory.create({
                            data: {
                                fulfilmentId: updated.id,
                                previousStatus,
                                newStatus: nextStatus,
                                actorUserId: authenticatedActorId,
                                note: statusChanged
                                    ? input.operationalNotes ?? null
                                    : 'Delivery details updated',
                            },
                        });

                        return tx.orderFulfilment.findUnique({
                            where: {
                                orderId: order.id,
                            },
                            include: {
                                history: {
                                    orderBy: {
                                        createdAt: 'desc',
                                    },
                                },
                            },
                        });
                    },
                    {
                        isolationLevel:
                            Prisma.TransactionIsolationLevel.Serializable,
                    },
                );
            } catch (error) {
                const isRetryableConflict =
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    (
                        error.code === 'P2034' ||
                        error.code === 'P2002'
                    );

                if (
                    isRetryableConflict &&
                    attempt < MAX_TRANSACTION_ATTEMPTS
                ) {
                    continue;
                }

                if (
                    isRetryableConflict &&
                    attempt === MAX_TRANSACTION_ATTEMPTS
                ) {
                    throw new BadRequestException(
                        'The fulfilment record changed concurrently. Please reload the order and try again.',
                    );
                }

                throw error;
            }
        }

        throw new BadRequestException(
            'Unable to update fulfilment. Please try again.',
        );
    }
}
