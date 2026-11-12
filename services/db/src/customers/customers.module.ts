import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerOtpService } from './services/customer-otp.service';
import { CustomerProfileService } from './services/customer-profile.service';

@Module({
    controllers: [
        CustomersController,
    ],
    providers: [
        CustomersService,
        CustomerOtpService,
        CustomerProfileService,
    ],
    exports: [
        CustomersService,
    ],
})
export class CustomersModule {}