import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { InternalServiceGuard } from '../common/guards/internal-service.guard';
import { CustomersService } from './customers.service';
import { CreateOtpChallengeDto } from './dto/create-otp-challenge.dto';
import { VerifyOtpChallengeDto } from './dto/verify-otp-challenge.dto';
import { UpsertCustomerProfileDto } from './dto/upsert-customer-profile.dto';

@Controller('customers')
@UseGuards(InternalServiceGuard)
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
    ) {}

    @Post('otp-challenges')
    createOtpChallenge(
        @Body() dto: CreateOtpChallengeDto,
    ) {
        return this.customersService.createOtpChallenge(
            dto.phone,
            dto.codeHash,
        );
    }

    @Post('otp-challenges/verify')
    verifyOtpChallenge(
        @Body() dto: VerifyOtpChallengeDto,
    ) {
        return this.customersService.verifyOtpChallenge(
            dto.phone,
            dto.codeHash,
        );
    }

    @Get('profiles')
    getProfile(
        @Query('tenantCode') tenantCode: string,
        @Query('identityId') identityId: string,
    ) {
        return this.customersService.getProfile(
            tenantCode,
            identityId,
        );
    }

    @Put('profiles')
    upsertProfile(
        @Query('tenantCode') tenantCode: string,
        @Query('identityId') identityId: string,
        @Body() dto: UpsertCustomerProfileDto,
    ) {
        return this.customersService.upsertProfile(
            tenantCode,
            identityId,
            dto,
        );
    }
}