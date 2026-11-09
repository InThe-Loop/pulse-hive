import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';

import { InternalServiceGuard } from '../common/guards/internal-service.guard';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(InternalServiceGuard)
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
    ) {}

    @Get('tenant/:tenantCode')
    async getProductsByTenantCode(
        @Param('tenantCode') tenantCode: string,
        @Query('section') section?: string,
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string,
        @Query('search') search?: string,
    ) {
        return this.productsService.getProductsByTenantCode(
            tenantCode,
            {
                section,
                limit,
                cursor,
                search,
            },
        );
    }
}
