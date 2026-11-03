import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { timingSafeEqual } from 'node:crypto';

@Injectable()
export class InternalServiceGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const expected = process.env.INTERNAL_SERVICE_KEY?.trim();

        const supplied = context
            .switchToHttp()
            .getRequest<{
                headers: Record<
                    string,
                    string | string[] | undefined
                >;
            }>()
            .headers['x-internal-service-key'];

        if (
            !expected ||
            typeof supplied !== 'string' ||
            supplied.length === 0
        ) {
            throw new UnauthorizedException(
                'Invalid internal service credentials',
            );
        }

        const expectedBuffer = Buffer.from(expected);
        const suppliedBuffer = Buffer.from(supplied);

        if (
            expectedBuffer.length !== suppliedBuffer.length ||
            !timingSafeEqual(expectedBuffer, suppliedBuffer)
        ) {
            throw new UnauthorizedException(
                'Invalid internal service credentials',
            );
        }

        return true;
    }
}
