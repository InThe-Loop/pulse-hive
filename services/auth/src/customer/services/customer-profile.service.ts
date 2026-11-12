import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomerProfileDto } from '../dto/customer-profile.dto';

@Injectable()
export class CustomerProfileService {
    private readonly dbServiceUrl: string;
    private readonly internalServiceKey: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.dbServiceUrl =
            this.configService.get<string>(
                'DB_SERVICE_URL',
                'http://db:4003',
            );

        this.internalServiceKey =
            this.configService.get<string>(
                'INTERNAL_SERVICE_KEY',
                '',
            );

        if (!this.internalServiceKey) {
            throw new Error(
                'INTERNAL_SERVICE_KEY is required.',
            );
        }
    }

    async getProfile(
        tenantCode: string,
        identityId: string,
    ) {
        return this.dbRequest(
            `/customers/profiles?tenantCode=${encodeURIComponent(tenantCode)}&identityId=${encodeURIComponent(identityId)}`,
        );
    }

    async upsertProfile(
        tenantCode: string,
        identityId: string,
        dto: CustomerProfileDto,
    ) {
        return this.dbRequest(
            `/customers/profiles?tenantCode=${encodeURIComponent(tenantCode)}&identityId=${encodeURIComponent(identityId)}`,
            {
                method: 'PUT',
                body: JSON.stringify(dto),
            },
        );
    }

    private async dbRequest(
        path: string,
        options: RequestInit = {},
    ): Promise<any> {
        const response = await fetch(
            `${this.dbServiceUrl}${path}`,
            {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-service-key':
                        this.internalServiceKey,
                    ...options.headers,
                },
            },
        );

        const result = await response.json().catch(() => null);

        if (response.ok) {
            return result;
        }

        if (response.status === 404) {
            throw new NotFoundException(
                result?.message ||
                'The requested customer profile or storefront was not found.',
            );
        }

        if (response.status === 401 || response.status === 403) {
            throw new NotFoundException(
                result?.message ||
                'The customer profile could not be accessed.',
            );
        }

        throw new InternalServerErrorException(
            result?.message ||
            'The customer profile request failed.',
        );
    }
}