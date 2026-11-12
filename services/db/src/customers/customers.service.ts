import { Injectable } from '@nestjs/common';
import { CustomerOtpService } from './services/customer-otp.service';
import { CustomerProfileService } from './services/customer-profile.service';
import { UpsertCustomerProfileDto } from './dto/upsert-customer-profile.dto';

@Injectable()
export class CustomersService {
    constructor(
        private readonly otpService: CustomerOtpService,
        private readonly profileService: CustomerProfileService,
    ) {}

    createOtpChallenge(
        phone: string,
        codeHash: string,
    ) {
        return this.otpService.createChallenge(
            phone,
            codeHash,
        );
    }

    verifyOtpChallenge(
        phone: string,
        codeHash: string,
    ) {
        return this.otpService.verifyChallenge(
            phone,
            codeHash,
        );
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
        dto: UpsertCustomerProfileDto,
    ) {
        return this.profileService.upsertProfile(
            tenantCode,
            identityId,
            dto,
        );
    }
}