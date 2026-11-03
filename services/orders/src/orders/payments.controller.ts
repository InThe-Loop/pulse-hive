import {
    Controller,
    ForbiddenException,
    Get,
    Headers,
    UseGuards,
} from '@nestjs/common';

import { InternalServiceGuard } from '../common/guards/internal-service.guard';

import { PaymentQueryService } from './services/payment-query.service';

@Controller('payments')
@UseGuards(InternalServiceGuard)
export class PaymentsController {
    constructor(
        private readonly paymentQueryService: PaymentQueryService,
    ) {}

    @Get()
    async findPayments(
        @Headers('x-tenant-id') tenantId?: string,
    ) {
        if (!tenantId?.trim()) {
            throw new ForbiddenException(
                'Authenticated tenant context is required',
            );
        }

        return this.paymentQueryService.findPayments(tenantId);
    }
}
