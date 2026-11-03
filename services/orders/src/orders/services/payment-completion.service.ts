import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    OrderStatus,
    PaymentProvider,
    PaymentStatus,
} from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { PaymentCompletedDto } from '../dto/payment-completed.dto';

@Injectable()
export class PaymentCompletionService {
    constructor(private readonly prisma: PrismaService) {}

    async handlePaymentCompleted(
        event: PaymentCompletedDto,
    ) {
        if (
            !event.tenantId ||
            !event.transactionReference
        ) {
            throw new BadRequestException(
                'Tenant ID and transaction reference are required',
            );
        }

        if (event.provider !== PaymentProvider.OZOW) {
            throw new BadRequestException(
                'Only Ozow completion events are accepted by this handler',
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
            !event.currency ||
            !/^[A-Z]{3}$/.test(event.currency)
        ) {
            throw new BadRequestException(
                'Payment currency is invalid',
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
                'Payment provider does not match the Ozow completion event',
            );
        }

        if (event.currency !== payment.currency) {
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

        if (payment.status === PaymentStatus.COMPLETED) {
            return {
                status: 'already_processed',
                paymentId: payment.id,
                orderId: payment.orderId,
            };
        }

        /*
         * A verified Complete notification can arrive after a
         * failure/cancellation notification. Allow it to complete
         * those payments, but never overwrite a refunded payment.
         */
        if (payment.status === PaymentStatus.REFUNDED) {
            throw new ConflictException(
                'A refunded payment cannot be completed',
            );
        }

        if (!payment.orderId) {
            throw new BadRequestException(
                `Payment ${payment.id} is not linked to an order`,
            );
        }

        const result = await this.prisma.$transaction(
            async (tx) => {
                const paymentUpdate =
                    await tx.payment.updateMany({
                        where: {
                            id: payment.id,
                            status: {
                                in: [
                                    PaymentStatus.PENDING,
                                    PaymentStatus.FAILED,
                                    PaymentStatus.CANCELLED,
                                ],
                            },
                        },
                        data: {
                            status: PaymentStatus.COMPLETED,
                            providerReference:
                                event.providerReference ??
                                payment.providerReference,
                            completedAt: new Date(),
                        },
                    });

                if (paymentUpdate.count !== 1) {
                    const currentPayment =
                        await tx.payment.findUnique({
                            where: {
                                id: payment.id,
                            },
                        });

                    if (
                        currentPayment?.status ===
                        PaymentStatus.COMPLETED
                    ) {
                        return {
                            orderId: payment.orderId!,
                            alreadyProcessed: true,
                        };
                    }

                    throw new ConflictException(
                        'Payment status changed before completion could be applied',
                    );
                }

                const updatedOrder =
                    await tx.order.update({
                        where: {
                            id: payment.orderId!,
                        },
                        data: {
                            paymentStatus:
                                PaymentStatus.COMPLETED,
                            status: OrderStatus.PAID,
                        },
                    });

                return {
                    orderId: updatedOrder.id,
                    alreadyProcessed: false,
                };
            },
        );

        return {
            status: result.alreadyProcessed
                ? 'already_processed'
                : 'processed',
            paymentId: payment.id,
            orderId: result.orderId,
        };
    }
}
