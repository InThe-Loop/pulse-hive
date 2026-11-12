import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertCustomerProfileDto } from '../dto/upsert-customer-profile.dto';

@Injectable()
export class CustomerProfileService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async getProfile(
        tenantCode: string,
        identityId: string,
    ) {
        const { tenant, identity } =
            await this.resolveContext(tenantCode, identityId);

        const profile =
            await this.prisma.customer.findUnique({
                where: {
                    tenantId_customerIdentityId: {
                        tenantId: tenant.id,
                        customerIdentityId: identity.id,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    address: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        if (!profile) {
            return null;
        }

        return profile;
    }

    async upsertProfile(
        tenantCode: string,
        identityId: string,
        dto: UpsertCustomerProfileDto,
    ) {
        const { tenant, identity } =
            await this.resolveContext(tenantCode, identityId);

        return this.prisma.customer.upsert({
            where: {
                tenantId_customerIdentityId: {
                    tenantId: tenant.id,
                    customerIdentityId: identity.id,
                },
            },
            create: {
                tenantId: tenant.id,
                customerIdentityId: identity.id,
                name: dto.name.trim(),
                phone: identity.phone,
                address: dto.address?.trim() || null,
            },
            update: {
                name: dto.name.trim(),
                phone: identity.phone,
                address: dto.address?.trim() || null,
            },
            select: {
                id: true,
                name: true,
                phone: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    private async resolveContext(
        tenantCode: string,
        identityId: string,
    ) {
        if (!tenantCode?.trim()) {
            throw new BadRequestException(
                'A tenant code is required.',
            );
        }

        const tenant = await this.prisma.tenant.findUnique({
            where: {
                tenantCode: tenantCode.trim(),
            },
            select: {
                id: true,
            },
        });

        if (!tenant) {
            throw new NotFoundException(
                'The requested storefront was not found.',
            );
        }

        const identity =
            await this.prisma.customerIdentity.findUnique({
                where: {
                    id: identityId,
                },
                select: {
                    id: true,
                    phone: true,
                    phoneVerifiedAt: true,
                    isActive: true,
                },
            });

        if (
            !identity ||
            !identity.isActive ||
            !identity.phoneVerifiedAt
        ) {
            throw new UnauthorizedException(
                'A verified customer identity is required.',
            );
        }

        return {
            tenant,
            identity,
        };
    }
}