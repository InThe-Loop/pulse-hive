import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';

import { PaymentCompletedDto } from './dto/payment-completed.dto';
import {
    CreatePendingOrderDto,
    SavePaymentRequestDto,
} from './dto/create-pending-order.dto';
import { OrderCreationService } from './services/order-creation.service';
import { PaymentCompletionService } from './services/payment-completion.service';
import { PaymentRequestService } from './services/payment-request.service';
import { PaymentStatusUpdateService } from './services/payment-status-update.service';

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

/**
 * Compatibility facade retained for existing controller and messaging callers.
 * Business logic lives in focused services under ./services.
 */
@Injectable()
export class OrdersService {
    constructor(
        private readonly orderCreationService: OrderCreationService,
        private readonly paymentCompletionService: PaymentCompletionService,
        private readonly paymentStatusUpdateService: PaymentStatusUpdateService,
        private readonly paymentRequestService: PaymentRequestService,
    ) {}

    createPendingOrder(input: CreatePendingOrderDto) {
        return this.orderCreationService.createPendingOrder(input);
    }

    handlePaymentCompleted(event: PaymentCompletedDto) {
        return this.paymentCompletionService.handlePaymentCompleted(event);
    }

    handlePaymentStatusUpdated(event: PaymentStatusUpdatedEvent) {
        return this.paymentStatusUpdateService.handlePaymentStatusUpdated(event);
    }

    savePaymentRequest(orderId: string, input: SavePaymentRequestDto) {
        return this.paymentRequestService.savePaymentRequest(orderId, input);
    }
}
