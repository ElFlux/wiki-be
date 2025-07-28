import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>, // Repository to fetch user from DB
    ) {
        super({
            // Extract JWT from Bearer token in Authorization header
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            // Don't ignore token expiration
            ignoreExpiration: false,

            // Secret key for validating JWT
            secretOrKey: process.env.JWT_SECRET as string,
        });
    }

    /* Validate JWT payload and return the user */
    async validate(payload: any): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id: payload.sub } });

        // Throw if user not found
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Return user object attached to request
        return user;
    }
}
