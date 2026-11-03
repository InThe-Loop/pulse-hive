import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { PaymentsController } from './payments.controller';

import { OrdersService } from './orders.service';

import { FulfilmentService } from './services/fulfilment.service';
import { OrderQueryService } from './services/order-query.service';
import { PaymentQueryService } from './services/payment-query.service';
import { OrderCreationService } from './services/order-creation.service';
import { PaymentCompletionService } from './services/payment-completion.service';
import { PaymentRequestService } from './services/payment-request.service';
import { PaymentStatusUpdateService } from './services/payment-status-update.service';

@Module({
    controllers: [
        OrdersController,
        PaymentsController,
    ],
    providers: [
        OrdersService,
        OrderQueryService,
        PaymentQueryService,
        FulfilmentService,
        OrderCreationService,
        PaymentCompletionService,
        PaymentRequestService,
        PaymentStatusUpdateService,
    ],
    exports: [
        OrdersService,
        OrderQueryService,
        FulfilmentService,
    ],
})
export class OrdersModule {}
