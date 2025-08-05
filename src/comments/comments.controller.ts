import {
    Controller,
    Post,
    Param,
    Body,
    UseGuards,
    Req,
    Get,
    ParseIntPipe,
    Delete, Patch,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {User} from "../users/users.entity";

@Controller('articles')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    async comment(
        @Param('id', ParseIntPipe) articleId: number, // Article ID
        @Body() body: { content: string }, // Comment text
        @Req() req: any, // Authenticated user info
    ) {
        console.log('Authenticated User:', req.user);
        return this.commentsService.create(articleId, req.user, body.content); // Create comment
    }

    @Get(':id/comments')
    async getComments(@Param('id', ParseIntPipe) articleId: number) {
        return this.commentsService.findAllByArticle(articleId); // List all comments for article
    }

    @Delete('comments/:commentId')
    @UseGuards(JwtAuthGuard)
    async deleteComment(
        @Param('commentId', ParseIntPipe) commentId: number, // Comment ID
        @Req() req: any, // Authenticated user info
    ) {
        console.log('Authenticated User (delete):', req.user);
        return this.commentsService.delete(commentId, req.user); // Delete comment
    }

    @UseGuards(JwtAuthGuard)
    @Patch('comments/:id') // Update route for comment
    update(
        @Param('id', ParseIntPipe) id: number, // Comment ID
        @Body() body: { content?: string }, // Updated content
        @Req() req: any // Authenticated user
    ) {
        const user = req.user as User;
        return this.commentsService.update(id, body, user); // Update comment
    }
}
