import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PaymentProvider, PaymentStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { SavePaymentRequestDto } from '../dto/create-pending-order.dto';

@Injectable()
export class PaymentRequestService {
    constructor(private readonly prisma: PrismaService) {}

    async savePaymentRequest(
        orderId: string,
        input: SavePaymentRequestDto,
    ) {
        if (
            typeof input.paymentRequestId !== 'string' ||
            !input.paymentRequestId.trim() ||
            input.paymentRequestId.length > 200
        ) {
            throw new BadRequestException(
                'A valid Ozow payment request ID is required.',
            );
        }

        if (
            typeof input.gatewayUrl !== 'string' ||
            !input.gatewayUrl.trim()
        ) {
            throw new BadRequestException(
                'A valid Ozow gateway URL is required.',
            );
        }

        let gateway: URL;

        try {
            gateway = new URL(input.gatewayUrl);
        } catch {
            throw new BadRequestException(
                'Invalid Ozow gateway URL.',
            );
        }

        if (
            gateway.protocol !== 'https:' ||
            gateway.hostname !== 'pay.ozow.com'
        ) {
            throw new BadRequestException(
                'Unexpected Ozow gateway host.',
            );
        }

        const payment = await this.prisma.payment.findFirst({
            where: {
                orderId,
                provider: PaymentProvider.OZOW,
            },
        });

        if (!payment) {
            throw new NotFoundException(
                'Pending Ozow payment not found for this order.',
            );
        }

        if (payment.status !== PaymentStatus.PENDING) {
            throw new ConflictException(
                'The payment is no longer pending.',
            );
        }

        if (
            payment.paymentRequestId &&
            (
                payment.paymentRequestId !== input.paymentRequestId ||
                payment.gatewayUrl !== input.gatewayUrl
            )
        ) {
            throw new ConflictException(
                'A different Ozow payment request is already saved.',
            );
        }

        const updated = await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                paymentRequestId: input.paymentRequestId,
                gatewayUrl: input.gatewayUrl,
            },
        });

        return {
            saved: true,
            paymentRequestId: updated.paymentRequestId,
            gatewayUrl: updated.gatewayUrl,
        };
    }
}
