import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    InternalServerErrorException,
    ConflictException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const VERIFICATION_TOKEN_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class AuthService {
    private readonly dbUrl =
        process.env.DB_SERVICE_URL || 'http://db:4003';

    private readonly adminAppUrl = (
        process.env.ADMIN_APP_URL || 'http://localhost:3001'
    ).replace(/\/+$/, '');

    constructor(private readonly jwtService: JwtService) {}

    private async dbRequest<T>(
        path: string,
        options: RequestInit = {},
    ): Promise<T> {
        const serviceKey = process.env.INTERNAL_SERVICE_KEY;

        if (!serviceKey) {
            throw new InternalServerErrorException(
                'Internal service authentication is not configured',
            );
        }

        let response: Response;

        try {
            response = await fetch(`${this.dbUrl}${path}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-service-key': serviceKey,
                    ...options.headers,
                },
            });
        } catch {
            throw new InternalServerErrorException(
                'Database service is unavailable',
            );
        }

        const body = await response.text();
        let result: any = null;

        if (body) {
            try {
                result = JSON.parse(body);
            } catch {
                if (response.ok) {
                    throw new InternalServerErrorException(
                        'Database service returned an invalid response',
                    );
                }
            }
        }

        if (!response.ok) {
            const message =
                result?.message || 'Database service request failed';

            if (response.status === 400) {
                throw new BadRequestException(message);
            }
            if (response.status === 401) {
                throw new UnauthorizedException(message);
            }
            if (response.status === 403) {
                throw new ForbiddenException(message);
            }
            if (response.status === 404) {
                throw new NotFoundException(message);
            }
            if (response.status === 409) {
                throw new ConflictException(message);
            }

            throw new InternalServerErrorException(message);
        }

        return result as T;
    }

    private hashVerificationToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private assertEmailDeliveryConfigured(): void {
        if (
            process.env.NODE_ENV === 'production' &&
            (!process.env.RESEND_API_KEY ||
                !process.env.EMAIL_FROM)
        ) {
            throw new InternalServerErrorException(
                'Email verification delivery is not configured',
            );
        }
    }

    private async issueVerification(
        userId: string,
        email: string,
    ): Promise<{ verificationUrl?: string }> {
        const rawToken = randomBytes(32).toString('base64url');
        const tokenHash = this.hashVerificationToken(rawToken);
        const expiresAt = new Date(
            Date.now() + VERIFICATION_TOKEN_TTL_MS,
        );

        const result = await this.dbRequest<{
            issued: boolean;
            alreadyVerified: boolean;
            email: string;
        }>(
            `/users/${encodeURIComponent(
                userId,
            )}/email-verification-tokens`,
            {
                method: 'POST',
                body: JSON.stringify({
                    tokenHash,
                    expiresAt: expiresAt.toISOString(),
                }),
            },
        );

        if (result.alreadyVerified || !result.issued) {
            return {};
        }

        const verificationUrl =
            `${this.adminAppUrl}/auth/verify-email?token=` +
            encodeURIComponent(rawToken);

        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.EMAIL_FROM;

        if (!apiKey || !from) {
            if (process.env.NODE_ENV === 'production') {
                throw new InternalServerErrorException(
                    'Email verification delivery is not configured',
                );
            }

            // Development only: never expose this URL in production.
            return { verificationUrl };
        }

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify your PulseHive email address</title>
            </head>
            <body style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#020617;padding:32px 12px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
                                <tr>
                                    <td style="background:#020617;padding:28px 32px;border-bottom:1px solid #1e293b;">
                                        <div style="font-size:25px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;line-height:1.2;">
                                            <span style="display:inline-block;width:15px;height:15px;background:#6366f1;border-radius:50%;vertical-align:middle;margin-right:7px;"></span><span>PulseHive</span><span style="display:inline-block;width:6px;height:6px;background:#818cf8;border-radius:50%;vertical-align:baseline;margin-left:3px;"></span>
                                        </div>
                                        <p style="margin:9px 0 0 0;color:#cbd5e1;font-size:12px;font-weight:600;letter-spacing:1px;">
                                            Move. Manage. Multiply.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:32px;">
                                        <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6366f1;">
                                            Account verification
                                        </p>
                                        <h1 style="margin:0 0 16px;font-size:25px;line-height:1.3;color:#0f172a;">
                                            Welcome to PulseHive
                                        </h1>
                                        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">
                                            Thanks for creating your account. Please verify your email address to continue.
                                        </p>
                                        <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#64748b;">
                                            This verification link expires in 30 minutes.
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="background:#4f46e5;border-radius:8px;">
                                                    <a href="${verificationUrl}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">
                                                        Verify email address
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin:28px 0 8px;font-size:12px;line-height:1.6;color:#64748b;">
                                            If the button doesn't work, copy this link into your browser:
                                        </p>
                                        <p style="margin:0;font-size:12px;line-height:1.6;word-break:break-all;">
                                            <a href="${verificationUrl}" style="color:#4f46e5;">${verificationUrl}</a>
                                        </p>
                                        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
                                            If you did not create this account, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:11px;letter-spacing:0.2px;">
                                        PulseHive &middot; Move. Manage. Multiply.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        let response: Response;

        try {
            response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from,
                    to: [email],
                    subject: 'Verify your PulseHive email address',
                    html,
                }),
            });
        } catch {
            throw new InternalServerErrorException(
                'Unable to send verification email',
            );
        }

        if (!response.ok) {
            // Do not log the token or the verification URL.
            throw new InternalServerErrorException(
                'Email provider rejected the verification email',
            );
        }

        return {};
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.dbRequest<any>(
            `/users/by-email?email=${encodeURIComponent(
                email.trim().toLowerCase(),
            )}`,
        );

        if (!user || !user.password) {
            return null;
        }

        const passwordMatches = await bcrypt.compare(
            pass,
            user.password,
        );

        if (!passwordMatches) {
            return null;
        }

        const { password, ...safeUser } = user;
        return safeUser;
    }

    async singin(loginDto: LoginDto) {
        const user = await this.validateUser(
            loginDto.email,
            loginDto.password,
        );

        if (!user) {
            throw new UnauthorizedException(
                'Invalid email or password.',
            );
        }

        if (!user.emailVerifiedAt) {
            throw new ForbiddenException(
                'Please verify your email address before signing in.',
            );
        }

        const payload = {
            id: user.id,
            role: user.role,
        };

        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async signout(userId: string) {
        console.log(`User ${userId} has logged out.`);
        return { message: 'Successfully logged out' };
    }

    async signup(dto: RegisterDto) {
        this.assertEmailDeliveryConfigured();

        const email = dto.email.trim().toLowerCase();

        const existingUser = await this.dbRequest<any>(
            `/users/by-email?email=${encodeURIComponent(email)}`,
        );

        if (existingUser) {
            throw new ConflictException(
                'A user account with this email address already exists.',
            );
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.dbRequest<UserResponseDto & {
            id: string;
            email: string;
            emailVerifiedAt?: Date | null;
        }>('/users', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password: hashedPassword,
                displayName:
                    dto.displayName?.trim() || email.split('@')[0],
            }),
        });

        const verification = await this.issueVerification(
            user.id,
            user.email,
        );

        return {
            ...user,
            emailVerificationRequired: true,
            ...verification,
        };
    }

    async verifyEmail(token: string) {
        if (
            typeof token !== 'string' ||
            token.length < 20 ||
            token.length > 200
        ) {
            throw new BadRequestException(
                'Invalid or expired verification link',
            );
        }

        const tokenHash = this.hashVerificationToken(token);

        return this.dbRequest<{
            verified: boolean;
            email: string;
            emailVerifiedAt: string;
        }>('/users/email-verification/verify', {
            method: 'POST',
            body: JSON.stringify({ tokenHash }),
        });
    }

    async resendVerificationEmail(emailInput: string) {
        this.assertEmailDeliveryConfigured();

        const email = emailInput?.trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new BadRequestException(
                'A valid email address is required',
            );
        }

        const genericResponse = {
            message:
                'If an unverified account exists for that address, a verification email will be sent.',
        };

        const user = await this.dbRequest<any>(
            `/users/by-email?email=${encodeURIComponent(email)}`,
        );

        if (!user || user.emailVerifiedAt) {
            return genericResponse;
        }

        await this.issueVerification(user.id, user.email);

        return genericResponse;
    }

    async getProfile(userId: string): Promise<UserResponseDto> {
        return this.dbRequest<UserResponseDto>(
            `/users/${encodeURIComponent(userId)}`,
        );
    }

    async updateProfile(
        userId: string,
        data: { displayName: string },
    ) {
        return this.dbRequest<any>(
            `/users/${encodeURIComponent(userId)}/profile`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    displayName: data.displayName,
                }),
            },
        );
    }

    async getMemberships(userId: string) {
        if (!userId?.trim()) {
            throw new BadRequestException(
                'User identity is required',
            );
        }

        return this.dbRequest<any[]>(
            `/internal/access/users/${encodeURIComponent(
                userId,
            )}/memberships`,
        );
    }

    private escapeHtml(value: string): string {
        return value.replace(/[&<>"']/g, (character) => {
            const entities: Record<string, string> = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            };

            return entities[character];
        });
    }

    private async sendInvitationEmail(input: {
        email: string;
        role: string;
        expiresAt: string | Date;
        token: string;
    }): Promise<void> {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.EMAIL_FROM;

        // Never create an invitation that we cannot attempt to deliver.
        if (!apiKey || !from) {
            throw new InternalServerErrorException(
                'Invitation email delivery is not configured',
            );
        }

        const acceptUrl =
            `${this.adminAppUrl}/auth/accept-invitation?token=` +
            encodeURIComponent(input.token);

        const role = this.escapeHtml(input.role);
        const expiry = this.escapeHtml(
            new Date(input.expiresAt).toLocaleString('en-ZA', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Africa/Johannesburg',
            }),
        );

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your PulseHive invitation</title>
            </head>
            <body style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#020617;padding:32px 12px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
                                <tr>
                                    <td style="background:#020617;padding:28px 32px;border-bottom:1px solid #1e293b;">
                                        <div style="font-size:25px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;line-height:1.2;">
                                            <span style="display:inline-block;width:15px;height:15px;background:#6366f1;border-radius:50%;vertical-align:middle;margin-right:7px;"></span><span>PulseHive</span><span style="display:inline-block;width:6px;height:6px;background:#818cf8;border-radius:50%;vertical-align:baseline;margin-left:3px;"></span>
                                        </div>
                                        <p style="margin:9px 0 0 0;color:#cbd5e1;font-size:12px;font-weight:600;letter-spacing:1px;">
                                            Move. Manage. Multiply.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:32px;">
                                        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#0f172a;">
                                            You're invited!
                                        </h1>
                                        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">
                                            You've been invited to join a PulseHive workspace.
                                            Your assigned role is
                                            <strong>${role}</strong>.
                                        </p>
                                        <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#475569;">
                                            Accept the invitation using the button below.
                                            This invitation expires on <strong>${expiry}</strong>.
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="background:#4f46e5;border-radius:8px;">
                                                    <a href="${acceptUrl}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">
                                                        Accept invitation
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin:28px 0 8px;font-size:12px;line-height:1.6;color:#64748b;">
                                            If the button doesn't work, copy this link into your browser:
                                        </p>
                                        <p style="margin:0;font-size:12px;line-height:1.6;word-break:break-all;">
                                            <a href="${acceptUrl}" style="color:#4f46e5;">${acceptUrl}</a>
                                        </p>
                                        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
                                            If you weren't expecting this invitation, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:11px;letter-spacing:0.2px;">
                                        PulseHive &middot; Move. Manage. Multiply.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        let response: Response;

        try {
            response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from,
                    to: [input.email],
                    subject: "You've been invited to PulseHive",
                    html,
                }),
            });
        } catch {
            throw new InternalServerErrorException(
                'Unable to send the invitation email',
            );
        }

        if (!response.ok) {
            throw new InternalServerErrorException(
                'Email provider rejected the invitation email',
            );
        }
    }

    async createInvitation(
        actorUserId: string,
        input: {
            tenantId?: string;
            email?: string;
            role?: string;
            expiresInMs?: number;
        },
    ) {
        if (!actorUserId?.trim()) {
            throw new BadRequestException('User identity is required');
        }

        if (!input.tenantId?.trim()) {
            throw new BadRequestException('Tenant ID is required');
        }

        const email = input.email?.trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new BadRequestException('A valid invitation email is required');
        }

        // Fail before creating a database record if delivery isn't configured.
        if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
            throw new InternalServerErrorException(
                'Invitation email delivery is not configured',
            );
        }

        const result = await this.dbRequest<{
            invitation: {
                id: string;
                tenantId: string;
                email: string;
                role: string;
                expiresAt: string;
                createdAt: string;
            };
            token: string;
        }>('/internal/access/invitations', {
            method: 'POST',
            headers: {
                'x-authenticated-user-id': actorUserId,
            },
            body: JSON.stringify({
                ...input,
                email,
            }),
        });

        if (!result?.invitation?.id || !result.token) {
            throw new InternalServerErrorException(
                'Invitation service returned an invalid response',
            );
        }

        try {
            await this.sendInvitationEmail({
                email: result.invitation.email,
                role: result.invitation.role,
                expiresAt: result.invitation.expiresAt,
                token: result.token,
            });
        } catch {
            // Best-effort cleanup. The database remains the authority for
            // invitation status; never return the raw token to the browser.
            try {
                await this.revokeInvitation(
                    actorUserId,
                    result.invitation.id,
                );
            } catch {
                // Preserve the delivery error. Any failed cleanup needs
                // operational follow-up rather than exposing token details.
            }

            throw new InternalServerErrorException(
                'The invitation could not be delivered. Please try again.',
            );
        }

        return {
            invitation: result.invitation,
            message: 'Invitation email sent successfully',
        };
    }

    async acceptInvitation(actorUserId: string, token: string) {
        return this.dbRequest<any>(
            '/internal/access/invitations/accept',
            {
                method: 'POST',
                headers: {
                    'x-authenticated-user-id': actorUserId,
                },
                body: JSON.stringify({ token }),
            },
        );
    }

    async revokeInvitation(
        actorUserId: string,
        invitationId: string,
    ) {
        return this.dbRequest<any>(
            `/internal/access/invitations/${encodeURIComponent(
                invitationId,
            )}/revoke`,
            {
                method: 'POST',
                headers: {
                    'x-authenticated-user-id': actorUserId,
                },
            },
        );
    }

    async onboardCompany(
        currentUserId: string,
        companyName: string,
    ) {
        const user = await this.dbRequest<{
            id: string;
            emailVerifiedAt?: string | null;
        }>(
            `/users/${encodeURIComponent(currentUserId)}`,
        );

        if (!user.emailVerifiedAt) {
            throw new ForbiddenException(
                'Please verify your email address before creating a workspace.',
            );
        }

        const name = companyName?.trim();

        if (!name) {
            throw new BadRequestException(
                'Business name is required',
            );
        }

        if (name.length > 150) {
            throw new BadRequestException(
                'Business name must not exceed 150 characters',
            );
        }

        return this.dbRequest<any>('/tenants/onboard', {
            method: 'POST',
            headers: {
                'x-authenticated-user-id': currentUserId,
            },
            body: JSON.stringify({ name }),
        });
    }

    async listTenantMembers(actorUserId: string, tenantId: string) {
        if (!actorUserId?.trim() || !tenantId?.trim()) {
            throw new BadRequestException(
                'User identity and tenant ID are required',
            );
        }

        return this.dbRequest<any[]>(
            `/internal/access/tenants/${encodeURIComponent(tenantId)}/members`,
            {
                headers: {
                    'x-authenticated-user-id': actorUserId,
                },
            },
        );
    }

    async listTenantInvitations(
        actorUserId: string,
        tenantId: string,
    ) {
        if (!actorUserId?.trim() || !tenantId?.trim()) {
            throw new BadRequestException(
                'User identity and tenant ID are required',
            );
        }

        return this.dbRequest<any[]>(
            `/internal/access/tenants/${encodeURIComponent(tenantId)}/invitations`,
            {
                headers: {
                    'x-authenticated-user-id': actorUserId,
                },
            },
        );
    }
}
