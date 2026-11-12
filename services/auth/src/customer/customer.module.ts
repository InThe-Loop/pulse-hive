import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerOtpService } from './services/customer-otp.service';
import { CustomerProfileService } from './services/customer-profile.service';
import { SmsProvider } from './providers/sms.provider';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'customer-jwt',
        }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>(
                    'CUSTOMER_JWT_SECRET',
                );

                if (!secret) {
                    throw new Error(
                        'CUSTOMER_JWT_SECRET is required.',
                    );
                }

                return {
                    secret,
                    signOptions: {
                        expiresIn: '7d',
                        issuer: 'pulsehive',
                        audience: 'pulsehive-customers',
                    },
                };
            },
        }),
    ],
    controllers: [
        CustomerController,
    ],
    providers: [
        CustomerService,
        CustomerOtpService,
        CustomerProfileService,
        SmsProvider,
        CustomerJwtStrategy,
    ],
    exports: [
        CustomerService,
        CustomerJwtStrategy,
        PassportModule,
    ],
})
export class CustomerModule {}