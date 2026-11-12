import {
    BadRequestException,
    ConflictException,
    GoneException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomInt, createHmac } from 'crypto';
import { SmsProvider } from '../providers/sms.provider';

@Injectable()
export class CustomerOtpService {
    private readonly dbServiceUrl: string;
    private readonly internalServiceKey: string;
    private readonly otpSecret: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly smsProvider: SmsProvider,
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

        this.otpSecret =
            this.configService.get<string>(
                'CUSTOMER_OTP_SECRET',
                '',
            );

        if (!this.internalServiceKey) {
            throw new Error(
                'INTERNAL_SERVICE_KEY is required.',
            );
        }

        if (!this.otpSecret) {
            throw new Error(
                'CUSTOMER_OTP_SECRET is required.',
            );
        }
    }

    async requestOtp(phone: string) {
        const code = randomInt(100000, 1000000).toString();
        const codeHash = this.hashOtp(phone, code);

        await this.dbRequest(
            '/customers/otp-challenges',
            {
                method: 'POST',
                body: JSON.stringify({
                    phone,
                    codeHash,
                }),
            },
        );

        await this.smsProvider.sendOtp(phone, code);

        return {
            success: true,
            message: 'A verification code has been sent.',
            expiresIn: 300,
            resendAvailableIn: 60,
        };
    }

    async verifyOtp(
        phone: string,
        code: string,
    ) {
        const codeHash = this.hashOtp(phone, code);

        const identity = await this.dbRequest(
            '/customers/otp-challenges/verify',
            {
                method: 'POST',
                body: JSON.stringify({
                    phone,
                    codeHash,
                }),
            },
        );

        const accessToken = await this.jwtService.signAsync({
            sub: identity.id,
            phone: identity.phone,
            type: 'customer',
        });

        return {
            success: true,
            accessToken,
            customer: {
                id: identity.id,
                phone: identity.phone,
                phoneVerifiedAt: identity.phoneVerifiedAt,
            },
        };
    }

    private hashOtp(
        phone: string,
        code: string,
    ): string {
        return createHmac(
            'sha256',
            this.otpSecret,
        )
            .update(`${phone}:${code}`)
            .digest('hex');
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

        const code = result?.code;
        const message =
            result?.message ||
            'The customer service request failed.';

        if (response.status === 410 || code === 'OTP_EXPIRED') {
            throw new GoneException({
                code: 'OTP_EXPIRED',
                message,
            });
        }

        if (
            response.status === 429 ||
            code === 'OTP_ATTEMPTS_EXCEEDED'
        ) {
            throw new HttpException(
                {
                    code: 'OTP_ATTEMPTS_EXCEEDED',
                    message,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        if (
            response.status === 409 ||
            code === 'OTP_RESEND_COOLDOWN'
        ) {
            throw new ConflictException({
                code: 'OTP_RESEND_COOLDOWN',
                message,
            });
        }

        if (
            response.status === 400 ||
            code === 'OTP_INVALID'
        ) {
            throw new BadRequestException({
                code: 'OTP_INVALID',
                message,
            });
        }

        throw new InternalServerErrorException(message);
    }
}