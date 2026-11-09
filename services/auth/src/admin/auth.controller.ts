import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('health')
    healthCheck() {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'Auth Service',
        };
    }

    @Post('signup')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.signup(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.singin(loginDto);
    }

    @Post('signout')
    @UseGuards(AuthGuard('gateway'))
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request) {
        const user = req.user as any;
        await this.authService.signout(user.id);
        return { success: true };
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Req() req: Request): Promise<UserResponseDto> {
        const user = req.user as { id?: string };

        if (!user?.id) {
            throw new UnauthorizedException(
                'Authenticated user identity is required',
            );
        }

        return this.authService.getProfile(user.id);
    }

    @Patch('profile')
    @UseGuards(AuthGuard('jwt'))
    async updateProfile(
        @Req() req: Request,
        @Body() updateDto: { displayName: string },
    ) {
        const user = req.user as { id?: string };

        if (!user?.id) {
            throw new UnauthorizedException(
                'Authenticated user identity is required',
            );
        }

        return this.authService.updateProfile(user.id, updateDto);
    }

    @Get('memberships')
    @UseGuards(AuthGuard('jwt'))
    async getMemberships(@Req() req: Request) {
        const user = req.user as { id?: string };

        if (!user?.id) {
            throw new UnauthorizedException(
                'Authenticated user identity is required',
            );
        }

        return this.authService.getMemberships(user.id);
    }

    @Post('invitations')
    @UseGuards(AuthGuard('jwt'))
    async createInvitation(
        @Req() req: Request,
        @Body()
        body: {
            tenantId?: string;
            email?: string;
            role?: string;
            expiresInMs?: number;
        },
    ) {
        const user = req.user as { id?: string };

        if (!user?.id) {
            throw new UnauthorizedException(
                'Authenticated user identity is required',
            );
        }

        if (
            body.expiresInMs !== undefined &&
            (!Number.isSafeInteger(body.expiresInMs) ||
                body.expiresInMs <= 0)
        ) {
            throw new BadRequestException(
                'expiresInMs must be a positive integer',
            );
        }

        return this.authService.createInvitation(user.id, body);
    }

    @Post('invitations/accept')
    @UseGuards(AuthGuard('jwt'))
    async acceptInvitation(
        @Req() req: Request,
        @Body() body: { token?: string },
    ) {
        const user = req.user as { id?: string };

        if (!user?.id) {
            throw new UnauthorizedException(
                'Authenticated user identity is required',
            );
        }

        if (typeof body.token !== 'string' || !body.token.trim()) {
            throw new BadRequestException('Invitation token is required');
        }

        return this.authService.acceptInvitation(user.id, body.token);
    }

    @Post('invitations/:id/revoke')
    @UseGuards(AuthGuard('jwt'))
    async revokeInvitation(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        const user = req.user as { id?: string };

        if (!user?.id) {
            throw new UnauthorizedException(
                'Authenticated user identity is required',
            );
        }

        if (!id.trim()) {
            throw new BadRequestException('Invitation ID is required');
        }

        return this.authService.revokeInvitation(user.id, id);
    }

    @Post('onboard')
    @UseGuards(AuthGuard('gateway'))
    async onboard(@Req() req: Request, @Body() body: any) {
        const user = req.user as any;

        if (!user?.id) {
            throw new UnauthorizedException('User not found in request');
        }

        return this.authService.onboardCompany(
            user.id,
            body.businessName,
        );
    }

    @Post('email/verify')
    verifyEmail(@Body() body: { token: string }) {
        return this.authService.verifyEmail(body.token);
    }

    @Post('email/resend')
    resendVerificationEmail(
        @Body() body: { email: string },
    ) {
        return this.authService.resendVerificationEmail(
            body.email,
        );
    }

    @Get('tenants/:tenantId/members')
    @UseGuards(AuthGuard('jwt'))
    listTenantMembers(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    ) {
        return this.authService.listTenantMembers(req.user.id, tenantId);
    }

    @Get('tenants/:tenantId/invitations')
    @UseGuards(AuthGuard('jwt'))
    listTenantInvitations(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    ) {
        return this.authService.listTenantInvitations(req.user.id, tenantId);
    }

}
