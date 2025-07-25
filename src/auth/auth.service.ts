import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService, // Users service for DB operations
        private jwtService: JwtService,     // JWT service for token handling
    ) {}

    /* Register a new user */
    async register(email: string, password: string, username: string) {
        return this.usersService.create(email, password, username);
    }

    /* Authenticate user and return JWT */
    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        // Check password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException();
        }

        // Prepare JWT payload
        const payload = { sub: user.id, email: user.email, role: user.role, username: user.username };

        // Return signed JWT
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
