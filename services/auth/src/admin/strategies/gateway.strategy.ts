import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';

@Injectable()
export class GatewayStrategy extends PassportStrategy(
  Strategy,
  'gateway',
) {
    constructor(private readonly configService: ConfigService) {
        super();
    }

    async validate(req: Request): Promise<any> {
        const expectedKey =
        this.configService.get<string>('INTERNAL_SERVICE_KEY');
        const providedKey = req.headers['x-internal-service-key'];

        if (
            !expectedKey ||
            typeof providedKey !== 'string' ||
            Buffer.byteLength(expectedKey) !== Buffer.byteLength(providedKey) ||
            !timingSafeEqual(
                Buffer.from(expectedKey),
                Buffer.from(providedKey),
            )
        ) {
            throw new UnauthorizedException('Untrusted gateway request');
        }

        const userId = req.headers['x-user-id'];
        const userRole = req.headers['x-user-role'];

        if (
            typeof userId !== 'string' ||
            !userId.trim() ||
            userId === 'undefined'
        ) {
            throw new UnauthorizedException(
                'No user context provided by gateway',
            );
        }

        return {
            id: userId,
            role: typeof userRole === 'string' ? userRole : undefined,
        };
    }
}
