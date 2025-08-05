import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { Article } from '../articles/articles.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, Article])], // Register entities
    controllers: [CommentsController],                        // Controller for comment routes
    providers: [CommentsService],                             // Service for comment logic
    exports: [CommentsService],                               // Export service for other modules
})
export class CommentsModule {}
