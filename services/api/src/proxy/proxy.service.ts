import { Injectable, RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest, FastifyReply } from 'fastify';
import * as jwt from 'jsonwebtoken';

import { IRequestUserContext } from '../common/interfaces/request-context.interface';

@Injectable()
export class ProxyService {
    private readonly routeMapping: Record<string, string>;
    private readonly jwtSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.jwtSecret = this.configService.get<string>('JWT_SECRET')!;

        this.routeMapping = {
            auth: this.configService.get<string>('AUTH_SERVICE_URL')!,
            orders: this.configService.get<string>('ORDER_SERVICE_URL')!,
            payments: this.configService.get<string>('ORDER_SERVICE_URL')!,
            tenants: this.configService.get<string>('DB_SERVICE_URL')!,
            users: this.configService.get<string>('DB_SERVICE_URL')!,
            products: this.configService.get<string>('DB_SERVICE_URL')!,
        };
    }

    async forward(req: FastifyRequest, reply: FastifyReply) {
        const path = req.url.split('?')[0];
        const segments = path.split('/').filter(Boolean);
        const targetKey = segments[0];
        const baseTarget = this.routeMapping[targetKey];

        if (!baseTarget) {
            return reply.code(404).send({
                statusCode: 404,
                error: 'Not Found',
                message: `No route for: '${targetKey ?? ''}'`,
            });
        }

        const downstreamUrl = `${baseTarget.replace(/\/+$/, '')}${req.url}`;
        const bodyBuffer = (req as RawBodyRequest<FastifyRequest>).rawBody;

        try {
            const forwardHeaders: Record<string, string> = {};

            // Never trust client-supplied identity or internal credentials.
            const blockedHeaders = new Set([
                'content-length',
                'host',
                'transfer-encoding',
                'x-internal-service-key',
                'x-user-id',
                'x-user-role',
                'x-tenant-id',
                'x-authenticated-user-id',
            ]);

            for (const [key, value] of Object.entries(req.headers)) {
                const normalizedKey = key.toLowerCase();

                if (
                    typeof value === 'string' &&
                    value.length > 0 &&
                    !blockedHeaders.has(normalizedKey)
                ) {
                    forwardHeaders[normalizedKey] = value;
                }
            }

            const internalServiceKey =
                this.configService.get<string>('INTERNAL_SERVICE_KEY');

            if (!internalServiceKey) {
                return reply.code(503).send({
                    statusCode: 503,
                    error: 'Service Unavailable',
                    message: 'Internal service authentication is not configured',
                });
            }

            forwardHeaders['x-internal-service-key'] = internalServiceKey;

            const authHeader = req.headers.authorization;
            let userContext: IRequestUserContext | undefined;

            if (
                typeof authHeader === 'string' &&
                authHeader.startsWith('Bearer ')
            ) {
                try {
                    const token = authHeader.slice('Bearer '.length);
                    const verified = jwt.verify(token, this.jwtSecret);

                    if (
                        typeof verified !== 'object' ||
                        verified === null ||
                        typeof verified.id !== 'string' ||
                        !verified.id.trim() ||
                        typeof verified.role !== 'string' ||
                        !verified.role.trim()
                    ) {
                        return reply.code(401).send({
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Invalid token payload',
                        });
                    }

                    userContext = {
                        id: verified.id,
                        role: verified.role,
                    };

                    forwardHeaders['x-user-id'] = userContext.id;
                    forwardHeaders['x-user-role'] = userContext.role;
                    forwardHeaders['x-authenticated-user-id'] = userContext.id;
                } catch {
                    return reply.code(401).send({
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Invalid token',
                    });
                }
            }

            const isPublicAuthEndpoint =
                targetKey === 'auth' &&
                req.method === 'POST' &&
                [
                    '/auth/signup',
                    '/auth/signin',
                    '/auth/email/verify',
                    '/auth/email/resend',
                ].includes(path);

            if (!userContext && !isPublicAuthEndpoint) {
                return reply.code(401).send({
                    statusCode: 401,
                    error: 'Unauthorized',
                    message: 'A valid bearer token is required',
                });
            }

            if (
                targetKey === 'tenants' &&
                path === '/tenants/onboard' &&
                !userContext
            ) {
                return reply.code(401).send({
                    statusCode: 401,
                    error: 'Unauthorized',
                    message: 'Sign in before onboarding a tenant',
                });
            }

            // Identify endpoints requiring tenant-scoped authorization.
            const isOrdersListing =
                targetKey === 'orders' &&
                req.method === 'GET' &&
                path === '/orders';

            const isPaymentsListing =
                targetKey === 'payments' &&
                req.method === 'GET' &&
                path === '/payments';

            const isFulfilmentUpdate =
                targetKey === 'orders' &&
                req.method === 'PATCH' &&
                /^\/orders\/[^/]+\/fulfilment$/.test(path);

            if (
                isOrdersListing ||
                isPaymentsListing ||
                isFulfilmentUpdate
            ) {
                if (!userContext) {
                    return reply.code(401).send({
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'A valid bearer token is required',
                    });
                }

                const requestedTenantHeader = req.headers['x-tenant-id'];
                const tenantId =
                    typeof requestedTenantHeader === 'string'
                        ? requestedTenantHeader.trim()
                        : '';

                if (!tenantId) {
                    return reply.code(400).send({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: 'Select a tenant before requesting this resource',
                    });
                }

                const dbServiceUrl =
                    this.configService.get<string>('DB_SERVICE_URL');

                if (!dbServiceUrl) {
                    return reply.code(503).send({
                        statusCode: 503,
                        error: 'Service Unavailable',
                        message: 'Tenant authorization is not configured',
                    });
                }

                const permission = isFulfilmentUpdate
                    ? 'orders.manage'
                    : isPaymentsListing
                      ? 'payments.read'
                      : 'orders.read';

                let authorizationResponse: Response;

                try {
                    authorizationResponse = await fetch(
                        `${dbServiceUrl.replace(/\/+$/, '')}/internal/access/authorize`,
                        {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json',
                                'x-internal-service-key': internalServiceKey,
                                'x-authenticated-user-id': userContext.id,
                            },
                            body: JSON.stringify({
                                tenantId,
                                permission,
                            }),
                        },
                    );
                } catch (error) {
                    console.error(
                        '[Tenant Authorization Error] Unable to reach DB service',
                        error,
                    );

                    return reply.code(503).send({
                        statusCode: 503,
                        error: 'Service Unavailable',
                        message: 'Tenant authorization is temporarily unavailable',
                    });
                }

                if (!authorizationResponse.ok) {
                    if (authorizationResponse.status === 403) {
                        const resource = isFulfilmentUpdate
                            ? 'manage orders for'
                            : isPaymentsListing
                              ? 'view payments for'
                              : 'view orders for';

                        return reply.code(403).send({
                            statusCode: 403,
                            error: 'Forbidden',
                            message: `You do not have permission to ${resource} this tenant`,
                        });
                    }

                    if (authorizationResponse.status === 400) {
                        return reply.code(400).send({
                            statusCode: 400,
                            error: 'Bad Request',
                            message: 'The tenant authorization request was rejected',
                        });
                    }

                    console.error(
                        '[Tenant Authorization Error] DB service returned status',
                        authorizationResponse.status,
                    );

                    return reply.code(503).send({
                        statusCode: 503,
                        error: 'Service Unavailable',
                        message: 'Tenant authorization could not be completed',
                    });
                }

                // Pass tenant context downstream only after permission is verified.
                forwardHeaders['x-tenant-id'] = tenantId;
            }

            if (
                ['POST', 'PUT', 'PATCH'].includes(req.method) &&
                bodyBuffer
            ) {
                forwardHeaders['content-type'] =
                    typeof req.headers['content-type'] === 'string'
                        ? req.headers['content-type']
                        : 'application/json';

                forwardHeaders['content-length'] =
                    Buffer.byteLength(bodyBuffer).toString();
            }

            forwardHeaders['x-forwarded-for'] = req.ip;
            forwardHeaders['host'] = new URL(baseTarget).host;

            const response = await fetch(downstreamUrl, {
                method: req.method,
                headers: forwardHeaders,
                body: bodyBuffer,
                duplex: 'half',
            } as any);

            response.headers.forEach((value, key) => {
                const normalizedKey = key.toLowerCase();

                if (
                    ![
                        'transfer-encoding',
                        'connection',
                        'keep-alive',
                        'content-length',
                        'set-cookie',
                    ].includes(normalizedKey)
                ) {
                    reply.header(key, value);
                }
            });

            const responseData = await response.text();

            try {
                return reply.code(response.status).send(
                    JSON.parse(responseData),
                );
            } catch {
                return reply.code(response.status).send(responseData);
            }
        } catch (error) {
            console.error(
                `[Gateway Routing Error] ${req.method} ${downstreamUrl}`,
                error,
            );

            return reply.code(503).send({
                statusCode: 503,
                error: 'Service Unavailable',
                message: 'Downstream service request failed',
            });
        }
    }
}
