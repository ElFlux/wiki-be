import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ArticlesModule} from "./articles/articles.module";
import { UsersModule } from './users/users.module';
import { CommentsModule} from "./comments/comments.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // make environment variables available globally
        }),
        TypeOrmModule.forRoot({
            type: 'postgres', // database type
            host: process.env.DATABASE_HOST, // DB host from env
            port: Number(process.env.DATABASE_PORT), // DB port from env
            username: process.env.DATABASE_USER, // DB username from env
            password: process.env.DATABASE_PASSWORD, // DB password from env
            database: process.env.DATABASE_NAME, // DB name from env
            autoLoadEntities: true, // auto load entities
            synchronize: true, // auto sync schema (use with caution in prod)
        }),
        AuthModule, // auth module
        ArticlesModule, // articles module
        UsersModule, // users module
        CommentsModule, // comments module
    ],
})
export class AppModule {} // main app module
