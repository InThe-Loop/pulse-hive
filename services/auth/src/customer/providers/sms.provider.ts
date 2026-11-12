import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsProvider {
    private readonly logger = new Logger(SmsProvider.name);

    constructor(
        private readonly configService: ConfigService,
    ) {}

    async sendOtp(
        phone: string,
        code: string,
    ): Promise<void> {
        const environment =
            this.configService.get<string>('NODE_ENV', 'development');

        if (environment === 'production') {
            throw new Error(
                'An SMS provider must be configured before production OTP delivery.',
            );
        }

        this.logger.warn(
            `[DEVELOPMENT ONLY] OTP for ${phone}: ${code}`,
        );
    }
}