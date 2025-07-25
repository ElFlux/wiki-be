import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /* Register a new user */
    @Post('register')
    register(@Body() body: { email: string; password: string; username: string }) {
        return this.authService.register(body.email, body.password, body.username);
    }

    /* Login existing user */
    @Post('login')
    login(@Body() body: { email: string; password: string }) {
        return this.authService.login(body.email, body.password);
    }

    /* Get current user info (requires JWT) */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Request() req: ExpressRequest) {
        return req.user;
    }

    /* Simple test route */
    @Get('hello')
    getHello(): string {
        return 'Backend dela!';
    }
}
