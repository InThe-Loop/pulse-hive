import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrderQueryService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findOrders(tenantId: string) {
        return this.prisma.order.findMany({
            where: {
                tenantId,
            },
            include: {
                customer: true,
                items: true,
                payments: true,
                fulfilment: {
                    include: {
                        history: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
