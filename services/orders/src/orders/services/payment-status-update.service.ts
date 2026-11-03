import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PaymentProvider, PaymentStatus, OrderStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';

interface PaymentStatusUpdatedEvent {
    tenantId: string;
    transactionReference: string;
    providerReference?: string;
    provider: PaymentProvider;
    amount: number;
    currency: string;
    ozowStatus: string;
    subStatus?: string;
    statusMessage?: string;
    optional1?: string;
    optional2?: string;
    optional3?: string;
    optional4?: string;
    optional5?: string;
}

@Injectable()
export class PaymentStatusUpdateService {
    constructor(private readonly prisma: PrismaService) {}

    async handlePaymentStatusUpdated(
        event: PaymentStatusUpdatedEvent,
    ) {
        if (
            !event ||
            typeof event.tenantId !== 'string' ||
            !event.tenantId.trim() ||
            typeof event.transactionReference !== 'string' ||
            !event.transactionReference.trim()
        ) {
            throw new BadRequestException(
                'Tenant ID and transaction reference are required',
            );
        }

        if (event.provider !== PaymentProvider.OZOW) {
            throw new BadRequestException(
                'Only Ozow status events are accepted by this handler',
            );
        }

        if (
            !Number.isFinite(event.amount) ||
            event.amount <= 0
        ) {
            throw new BadRequestException(
                'Payment amount must be a positive number',
            );
        }

        if (
            typeof event.currency !== 'string' ||
            !/^[A-Z]{3}$/.test(event.currency)
        ) {
            throw new BadRequestException(
                'Payment currency is invalid',
            );
        }

        if (typeof event.ozowStatus !== 'string') {
            throw new BadRequestException(
                'Ozow payment status is required',
            );
        }

        const statusMapping: Record<
            string,
            PaymentStatus
        > = {
            Pending: PaymentStatus.PENDING,
            PendingInvestigation: PaymentStatus.PENDING,
            Cancelled: PaymentStatus.CANCELLED,
            Error: PaymentStatus.FAILED,
            Abandoned: PaymentStatus.FAILED,
        };

        const targetStatus =
            statusMapping[event.ozowStatus];

        if (!targetStatus) {
            throw new BadRequestException(
                `Unsupported Ozow payment status: ${event.ozowStatus}`,
            );
        }

        const payment = await this.prisma.payment.findFirst({
            where: {
                tenantId: event.tenantId,
                transactionReference:
                    event.transactionReference,
            },
        });

        if (!payment) {
            throw new NotFoundException(
                `Payment not found for transaction ${event.transactionReference}`,
            );
        }

        if (payment.provider !== PaymentProvider.OZOW) {
            throw new BadRequestException(
                'Payment provider does not match the Ozow status event',
            );
        }

        if (payment.currency !== event.currency) {
            throw new BadRequestException(
                'Payment currency does not match the stored payment',
            );
        }

        const eventAmountCents =
            Math.round(event.amount * 100);

        const storedAmountCents =
            Math.round(Number(payment.amount) * 100);

        if (
            !Number.isSafeInteger(eventAmountCents) ||
            !Number.isSafeInteger(storedAmountCents) ||
            eventAmountCents <= 0 ||
            eventAmountCents !== storedAmountCents
        ) {
            throw new BadRequestException(
                'Payment amount does not match the stored payment',
            );
        }

        /*
         * Completed and refunded payments must never be downgraded
         * by a non-completion notification.
         */
        if (
            payment.status === PaymentStatus.COMPLETED ||
            payment.status === PaymentStatus.REFUNDED
        ) {
            return {
                status: 'ignored',
                reason: `Payment is already ${payment.status}`,
                paymentId: payment.id,
                orderId: payment.orderId,
            };
        }

        /*
         * Pending notifications must not reopen failed or cancelled
         * payments. A later verified Complete notification is handled
         * separately by handlePaymentCompleted().
         */
        if (
            targetStatus === PaymentStatus.PENDING &&
            payment.status !== PaymentStatus.PENDING
        ) {
            return {
                status: 'ignored',
                reason: `A ${event.ozowStatus} notification cannot reopen a ${payment.status} payment`,
                paymentId: payment.id,
                orderId: payment.orderId,
            };
        }

        const optionalFields = [
            event.optional1,
            event.optional2,
            event.optional3,
            event.optional4,
            event.optional5,
        ];

        for (const [index, value] of optionalFields.entries()) {
            if (
                value !== undefined &&
                (
                    typeof value !== 'string' ||
                    value.length > 50
                )
            ) {
                throw new BadRequestException(
                    `Ozow optional field ${index + 1} is invalid`,
                );
            }
        }

        if (
            event.subStatus !== undefined &&
            (
                typeof event.subStatus !== 'string' ||
                event.subStatus.length > 100
            )
        ) {
            throw new BadRequestException(
                'Ozow sub-status is invalid',
            );
        }

        if (
            event.statusMessage !== undefined &&
            (
                typeof event.statusMessage !== 'string' ||
                event.statusMessage.length > 500
            )
        ) {
            throw new BadRequestException(
                'Ozow status message is invalid',
            );
        }

        const providerStatusMessage = [
            `Status=${event.ozowStatus}`,
            event.subStatus
                ? `SubStatus=${event.subStatus}`
                : undefined,
            event.statusMessage
                ? `Message=${event.statusMessage}`
                : undefined,
        ]
            .filter(Boolean)
            .join('; ')
            .slice(0, 500);

        const result = await this.prisma.$transaction(
            async (tx) => {
                const allowedCurrentStatuses =
                    targetStatus === PaymentStatus.PENDING
                        ? [PaymentStatus.PENDING]
                        : [
                              PaymentStatus.PENDING,
                              targetStatus,
                          ];

                const paymentUpdate =
                    await tx.payment.updateMany({
                        where: {
                            id: payment.id,
                            status: {
                                in: allowedCurrentStatuses,
                            },
                        },
                        data: {
                            status: targetStatus,
                            providerReference:
                                event.providerReference ??
                                payment.providerReference,
                            providerStatusMessage,
                            providerOptional1:
                                event.optional1 ?? undefined,
                            providerOptional2:
                                event.optional2 ?? undefined,
                            providerOptional3:
                                event.optional3 ?? undefined,
                            providerOptional4:
                                event.optional4 ?? undefined,
                            providerOptional5:
                                event.optional5 ?? undefined,
                        },
                    });

                if (paymentUpdate.count !== 1) {
                    const currentPayment =
                        await tx.payment.findUnique({
                            where: {
                                id: payment.id,
                            },
                        });

                    /*
                     * A concurrent completion/refund takes priority
                     * over this status event.
                     */
                    if (
                        currentPayment?.status ===
                            PaymentStatus.COMPLETED ||
                        currentPayment?.status ===
                            PaymentStatus.REFUNDED
                    ) {
                        return {
                            status: 'ignored' as const,
                            currentStatus:
                                currentPayment.status,
                        };
                    }

                    /*
                     * A concurrent terminal update must not be
                     * overwritten by a stale Pending notification.
                     */
                    if (
                        targetStatus === PaymentStatus.PENDING &&
                        currentPayment?.status !==
                            PaymentStatus.PENDING
                    ) {
                        return {
                            status: 'ignored' as const,
                            currentStatus:
                                currentPayment?.status,
                        };
                    }

                    throw new ConflictException(
                        'Payment status changed before the Ozow update could be applied',
                    );
                }

                if (!payment.orderId) {
                    return {
                        status: 'processed' as const,
                        currentStatus: targetStatus,
                    };
                }

                if (
                    targetStatus === PaymentStatus.CANCELLED ||
                    targetStatus === PaymentStatus.FAILED
                ) {
                    /*
                     * Only update the payment status on an order
                     * that has not already progressed beyond
                     * awaiting payment.
                     */
                    await tx.order.updateMany({
                        where: {
                            id: payment.orderId,
                            status: OrderStatus.PENDING_PAYMENT,
                            paymentStatus: PaymentStatus.PENDING,
                        },
                        data: {
                            paymentStatus: targetStatus,
                        },
                    });
                }

                return {
                    status: 'processed' as const,
                    currentStatus: targetStatus,
                };
            },
        );

        return {
            status: result.status,
            paymentId: payment.id,
            orderId: payment.orderId,
            paymentStatus:
                'currentStatus' in result
                    ? result.currentStatus
                    : targetStatus,
            ozowStatus: event.ozowStatus,
        };
    }
}
