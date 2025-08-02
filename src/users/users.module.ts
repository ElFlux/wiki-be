import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])], // register User entity with TypeORM
    providers: [UsersService], // provide UsersService
    controllers: [UsersController], // register UsersController
    exports: [UsersService, TypeOrmModule], // export service and module for use elsewhere
})
export class UsersModule {} // Users module definition
