import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new InternalServerErrorException(
                'JWT_SECRET environment variable is not configured',
            );
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: { id: string; role: string }) {
        return {
            id: payload.id,
            role: payload.role,
        };
    }
}
