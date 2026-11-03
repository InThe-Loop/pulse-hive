import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

const PAYMENT_RECORD_LIMIT = 100;

@Injectable()
export class PaymentQueryService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findPayments(tenantId: string) {
        return this.prisma.payment.findMany({
            where: {
                tenantId,
            },
            select: {
                id: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                amount: true,
                currency: true,
                provider: true,
                providerReference: true,
                transactionReference: true,
                paymentRequestId: true,
                status: true,
                providerStatusMessage: true,
                createdAt: true,
                completedAt: true,
                updatedAt: true,
                order: {
                    select: {
                        id: true,
                        reference: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: PAYMENT_RECORD_LIMIT,
        });
    }
}
