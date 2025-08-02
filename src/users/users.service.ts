import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) {}

    /* Create a new user */
    async create(email: string, password: string, username: string) {
        const hashed = await bcrypt.hash(password, 10);
        const user = this.repo.create({ email, password: hashed, username });
        return this.repo.save(user);
    }

    /* Get all users (admin only, password stripped) */
    async findAll(requestingUser: User): Promise<Omit<User, 'password'>[]> {
        if (requestingUser.role !== 'admin') {
            throw new ForbiddenException('Only admins can view all users');
        }

        const users = await this.repo.find();
        return users.map(({ password, ...rest }) => rest);
    }

    /* Get single user (self or admin) */
    async findOne(id: number, requestingUser: User): Promise<Omit<User, 'password'>> {
        if (requestingUser.id !== id && requestingUser.role !== 'admin') {
            throw new ForbiddenException('You cannot view this user');
        }

        const user = await this.repo.findOneBy({ id });
        if (!user) throw new NotFoundException('User not found');

        const { password, ...rest } = user;
        return rest;
    }

    /* Update user (self or admin) */
    async update(
        userId: number,
        data: Partial<{ email: string; username: string; password: string }>,
        requestingUser?: User,
    ) {
        if (requestingUser && requestingUser.id !== userId && requestingUser.role !== 'admin') {
            throw new ForbiddenException('You cannot update this user');
        }

        const user = await this.repo.findOneBy({ id: userId });
        if (!user) throw new NotFoundException('User not found');

        if (data.email !== undefined) user.email = data.email;
        if (data.username !== undefined) user.username = data.username;
        if (data.password !== undefined) {
            user.password = await bcrypt.hash(data.password, 10);
        }

        return this.repo.save(user);
    }

    /* Delete user (self or admin) */
    async delete(userId: number, requestingUser: User) {
        if (requestingUser.id !== userId && requestingUser.role !== 'admin') {
            throw new ForbiddenException('You cannot delete this user');
        }

        const user = await this.repo.findOneBy({ id: userId });
        if (!user) throw new NotFoundException('User not found');

        await this.repo.remove(user);
        return { message: `User ${userId} deleted` };
    }

    /* Internal use (login, etc.) */
    findByEmail(email: string) {
        return this.repo.findOne({ where: { email } });
    }
}
