import {
    Controller,
    Get,
    Patch,
    Post,
    Delete,
    Body,
    Req,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './users.entity';

// Base route
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // GET /users
    @Get()
    getHello() {
        return { msg: 'Users endpoint' };
    }

    // GET /users/me (current user)
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: Request) {
        return req.user;
    }

    // PATCH /users/me (update current user)
    @UseGuards(JwtAuthGuard)
    @Patch('me')
    async updateMe(
        @Req() req: Request,
        @Body() updateData: Partial<{ email: string; username: string; password: string }>
    ) {
        const userId = (req.user as any).id;
        return this.usersService.update(userId, updateData, req.user as User);
    }

    // GET /users/all
    @UseGuards(JwtAuthGuard)
    @Get('all')
    findAll(@Req() req: Request) {
        return this.usersService.findAll(req.user as User);
    }

    // GET /users/:id
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        return this.usersService.findOne(id, req.user as User);
    }

    // DELETE /users/:id
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        return this.usersService.delete(id, req.user as User);
    }
}
