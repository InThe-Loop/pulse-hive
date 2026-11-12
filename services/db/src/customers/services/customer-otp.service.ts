import {
    BadRequestException,
    ConflictException,
    GoneException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CustomerOtpService {
    private readonly challengeLifetimeMs = 5 * 60 * 1000;
    private readonly resendCooldownMs = 60 * 1000;
    private readonly maxAttempts = 5;

    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async createChallenge(
        phone: string,
        codeHash: string,
    ) {
        const now = new Date();

        try {
            return await this.prisma.$transaction(
                async (transaction) => {
                    const latestChallenge =
                        await transaction.customerOtpChallenge.findFirst({
                            where: {
                                phone,
                                createdAt: {
                                    gte: new Date(
                                        now.getTime() -
                                        this.resendCooldownMs,
                                    ),
                                },
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                        });

                    if (latestChallenge) {
                        throw new ConflictException({
                            code: 'OTP_RESEND_COOLDOWN',
                            message:
                                'Please wait before requesting another verification code.',
                        });
                    }

                    await transaction.customerOtpChallenge.updateMany({
                        where: {
                            phone,
                            consumedAt: null,
                        },
                        data: {
                            consumedAt: now,
                        },
                    });

                    return transaction.customerOtpChallenge.create({
                        data: {
                            phone,
                            codeHash,
                            attempts: 0,
                            maxAttempts: this.maxAttempts,
                            expiresAt: new Date(
                                now.getTime() +
                                this.challengeLifetimeMs,
                            ),
                        },
                        select: {
                            id: true,
                            phone: true,
                            expiresAt: true,
                        },
                    });
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }

            throw error;
        }
    }

    async verifyChallenge(
        phone: string,
        codeHash: string,
    ) {
        const now = new Date();

        return this.prisma.$transaction(
            async (transaction) => {
                const challenge =
                    await transaction.customerOtpChallenge.findFirst({
                        where: {
                            phone,
                            consumedAt: null,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    });

                if (!challenge) {
                    throw new BadRequestException({
                        code: 'OTP_INVALID',
                        message:
                            'The verification code is incorrect or no longer valid.',
                    });
                }

                if (challenge.expiresAt <= now) {
                    await transaction.customerOtpChallenge.updateMany({
                        where: {
                            id: challenge.id,
                            consumedAt: null,
                        },
                        data: {
                            consumedAt: now,
                        },
                    });

                    throw new GoneException({
                        code: 'OTP_EXPIRED',
                        message:
                            'Your verification code has expired. Please request a new code.',
                    });
                }

                if (challenge.attempts >= challenge.maxAttempts) {
                    throw new HttpException(
                        {
                            code: 'OTP_ATTEMPTS_EXCEEDED',
                            message:
                                'Too many incorrect attempts. Please request a new code.',
                        },
                        HttpStatus.TOO_MANY_REQUESTS,
                    );
                }

                if (challenge.codeHash !== codeHash) {
                    await transaction.customerOtpChallenge.updateMany({
                        where: {
                            id: challenge.id,
                            consumedAt: null,
                        },
                        data: {
                            attempts: {
                                increment: 1,
                            },
                        },
                    });

                    return {
                        status: 'INVALID' as const,
                    };
                }

                const consumed =
                    await transaction.customerOtpChallenge.updateMany({
                        where: {
                            id: challenge.id,
                            consumedAt: null,
                            attempts: {
                                lt: challenge.maxAttempts,
                            },
                        },
                        data: {
                            consumedAt: now,
                        },
                    });

                if (consumed.count !== 1) {
                    return {
                        status: 'INVALID' as const,
                    };
                }

                const identity =
                    await transaction.customerIdentity.upsert({
                        where: {
                            phone,
                        },
                        create: {
                            phone,
                            phoneVerifiedAt: now,
                            isActive: true,
                        },
                        update: {
                            phoneVerifiedAt: now,
                            isActive: true,
                        },
                        select: {
                            id: true,
                            phone: true,
                            phoneVerifiedAt: true,
                        },
                    });

                return {
                    status: 'VERIFIED' as const,
                    identity,
                };
            },
        ).then((result) => {
            if (result.status === 'INVALID') {
                return this.handleInvalidChallenge(phone);
            }

            return result.identity;
        });
    }

    private async handleInvalidChallenge(phone: string): Promise<never> {
        const challenge =
            await this.prisma.customerOtpChallenge.findFirst({
                where: {
                    phone,
                    consumedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

        if (!challenge) {
            throw new BadRequestException({
                code: 'OTP_INVALID',
                message:
                    'The verification code is incorrect or no longer valid.',
            });
        }

        if (challenge.attempts >= challenge.maxAttempts) {
            throw new HttpException(
                {
                    code: 'OTP_ATTEMPTS_EXCEEDED',
                    message:
                        'Too many incorrect attempts. Please request a new code.',
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        throw new BadRequestException({
            code: 'OTP_INVALID',
            message:
                'The verification code is incorrect or no longer valid.',
        });
    }
}