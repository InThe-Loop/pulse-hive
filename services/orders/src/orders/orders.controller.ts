import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    Headers,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { InternalServiceGuard } from '../common/guards/internal-service.guard';

import {
    CreatePendingOrderDto,
    SavePaymentRequestDto,
} from './dto/create-pending-order.dto';

import { UpdateFulfilmentDto } from './dto/update-fulfilment.dto';

import { FulfilmentService } from './services/fulfilment.service';
import { OrderQueryService } from './services/order-query.service';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(InternalServiceGuard)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly orderQueryService: OrderQueryService,
        private readonly fulfilmentService: FulfilmentService,
    ) {}

    @Get()
    async findOrders(
        @Headers('x-tenant-id') tenantId?: string,
    ) {
        if (!tenantId?.trim()) {
            throw new ForbiddenException(
                'Authenticated tenant context is required',
            );
        }

        return this.orderQueryService.findOrders(tenantId);
    }

    @Post()
    async createPendingOrder(
        @Body() input: CreatePendingOrderDto,
    ) {
        return this.ordersService.createPendingOrder(input);
    }

    @Patch(':orderId/payment-request')
    async savePaymentRequest(
        @Param('orderId') orderId: string,
        @Body() input: SavePaymentRequestDto,
    ) {
        return this.ordersService.savePaymentRequest(
            orderId,
            input,
        );
    }

    @Patch(':orderId/fulfilment')
    async updateFulfilment(
        @Param('orderId') orderId: string,
        @Headers('x-tenant-id') tenantId?: string,
        @Headers('x-user-id') actorUserId?: string,
        @Body() input?: UpdateFulfilmentDto,
    ) {
        if (!tenantId?.trim()) {
            throw new ForbiddenException(
                'Authenticated tenant context is required',
            );
        }

        if (!actorUserId?.trim()) {
            throw new ForbiddenException(
                'Authenticated user identity is required for fulfilment auditing',
            );
        }

        if (!input) {
            throw new BadRequestException(
                'Fulfilment update payload is required',
            );
        }

        return this.fulfilmentService.updateFulfilment(
            tenantId,
            orderId,
            actorUserId,
            input,
        );
    }
}
