import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface CustomerJwtPayload {
    sub: string;
    phone: string;
    type: string;
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
    Strategy,
    'customer-jwt',
) {
    constructor(
        configService: ConfigService,
    ) {
        const secret = configService.get<string>(
            'CUSTOMER_JWT_SECRET',
        );

        if (!secret) {
            throw new Error(
                'CUSTOMER_JWT_SECRET is required.',
            );
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
            issuer: 'pulsehive',
            audience: 'pulsehive-customers',
        });
    }

    validate(payload: CustomerJwtPayload) {
        if (
            payload.type !== 'customer' ||
            !payload.sub ||
            !payload.phone
        ) {
            throw new UnauthorizedException(
                'Invalid customer access token.',
            );
        }

        return {
            customerId: payload.sub,
            phone: payload.phone,
        };
    }
}