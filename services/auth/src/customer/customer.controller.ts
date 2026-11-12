import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomerService } from './customer.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CustomerProfileDto } from './dto/customer-profile.dto';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';

interface CustomerRequest extends Request {
    user: {
        customerId: string;
        phone: string;
    };
}

@Controller('customer')
export class CustomerController {
    constructor(
        private readonly customerService: CustomerService,
    ) {}

    @Post('auth/request-otp')
    requestOtp(
        @Body() dto: RequestOtpDto,
    ) {
        return this.customerService.requestOtp(dto.phone);
    }

    @Post('auth/verify-otp')
    verifyOtp(
        @Body() dto: VerifyOtpDto,
    ) {
        return this.customerService.verifyOtp(
            dto.phone,
            dto.code,
        );
    }

    @Get('auth/me')
    @UseGuards(CustomerJwtGuard)
    getMe(
        @Req() request: CustomerRequest,
    ) {
        return {
            id: request.user.customerId,
            phone: request.user.phone,
        };
    }

    @Get('profile')
    @UseGuards(CustomerJwtGuard)
    getProfile(
        @Req() request: CustomerRequest,
        @Query('tenantCode') tenantCode: string,
    ) {
        return this.customerService.getProfile(
            tenantCode,
            request.user.customerId,
        );
    }

    @Patch('profile')
    @UseGuards(CustomerJwtGuard)
    updateProfile(
        @Req() request: CustomerRequest,
        @Query('tenantCode') tenantCode: string,
        @Body() dto: CustomerProfileDto,
    ) {
        return this.customerService.upsertProfile(
            tenantCode,
            request.user.customerId,
            dto,
        );
    }
}