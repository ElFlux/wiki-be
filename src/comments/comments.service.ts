import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comments.entity';
import { Article } from '../articles/articles.entity';
import { User } from '../users/users.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private commentRepo: Repository<Comment>, // inject comment repository
        @InjectRepository(Article)
        private articleRepo: Repository<Article>, // inject article repository
    ) {}

    async create(articleId: number, user: User, content: string) {
        const article = await this.articleRepo.findOne({ where: { id: articleId } }); // find the article

        if (!article) {
            throw new NotFoundException(`Article with ID ${articleId} not found`); // article not found
        }

        const comment = this.commentRepo.create({
            content, // comment text
            user,    // comment author
            article, // associated article
        });

        return this.commentRepo.save(comment); // save comment to DB
    }

    async findAllByArticle(articleId: number) {
        return this.commentRepo.find({
            where: { article: { id: articleId } }, // filter by article
            relations: ['user'], // include user info
            select: {
                id: true,
                content: true,
                created_at: true,
                user: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            order: { created_at: 'DESC' }, // newest first
        });
    }


    async delete(commentId: number, user: User) {
        // console logs for debugging
        /*
        console.log('Deleting comment:', commentId);
        console.log('Requesting user:', user);
        */

        if (!user?.id) {
            throw new ForbiddenException('Invalid user or not authenticated'); // user check
        }

        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['user'], // include user info
        });


        if (!comment) {
            throw new NotFoundException('Comment not found'); // comment not found
        }

        const commentUserId = comment.user?.id;

        if (commentUserId && commentUserId !== user.id && user.role !== 'admin') {
            throw new ForbiddenException('You cannot delete this comment'); // permission check
        }

        await this.commentRepo.remove(comment); // remove comment
        return { message: 'Comment deleted' }; // success message
    }

    async update(commentId: number, data: { content?: string }, user: User) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['user'], // include user info
        });

        if (!comment) {
            throw new NotFoundException('Comment not found'); // comment not found
        }

        if (comment.user?.id !== user.id && user.role !== 'admin') {
            throw new ForbiddenException('You cannot edit this comment'); // permission check
        }

        if (data.content !== undefined) comment.content = data.content; // update content

        return this.commentRepo.save(comment); // save changes
    }
}
