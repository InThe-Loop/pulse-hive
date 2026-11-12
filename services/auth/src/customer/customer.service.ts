import { Injectable } from '@nestjs/common';
import { CustomerOtpService } from './services/customer-otp.service';
import { CustomerProfileService } from './services/customer-profile.service';
import { CustomerProfileDto } from './dto/customer-profile.dto';

@Injectable()
export class CustomerService {
    constructor(
        private readonly otpService: CustomerOtpService,
        private readonly profileService: CustomerProfileService,
    ) {}

    requestOtp(phone: string) {
        return this.otpService.requestOtp(phone);
    }

    verifyOtp(
        phone: string,
        code: string,
    ) {
        return this.otpService.verifyOtp(phone, code);
    }

    getProfile(
        tenantCode: string,
        identityId: string,
    ) {
        return this.profileService.getProfile(
            tenantCode,
            identityId,
        );
    }

    upsertProfile(
        tenantCode: string,
        identityId: string,
        dto: CustomerProfileDto,
    ) {
        return this.profileService.upsertProfile(
            tenantCode,
            identityId,
            dto,
        );
    }
}