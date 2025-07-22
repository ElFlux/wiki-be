import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from "./articles.entity";
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

/* Articles module */
@Module({
    imports: [
        TypeOrmModule.forFeature([Article]) // Register Article entity with TypeORM
    ],
    controllers: [ArticlesController], // Handles HTTP requests
    providers: [ArticlesService],       // Business logic for articles
    exports: [ArticlesService],         // Make service available outside module
})
export class ArticlesModule {}
