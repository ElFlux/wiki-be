import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './articles.entity';
import { User } from '../users/users.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private articleRepo: Repository<Article>,
    ) {}

    /* Fetch all articles with limited user info and comments relation */
    findAll(): Promise<Article[]> {
        return this.articleRepo.find({
            relations: ['comments', 'user'],
            select: {
                id: true,
                title: true,
                content: true,
                created_at: true,
                images: true,
                user: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            order: { created_at: 'DESC' },
        });
    }

    /* Fetch single article by ID with comments, author, and updater info */
    findOne(id: number): Promise<Article | null> {
        return this.articleRepo.findOne({
            where: { id },
            relations: ['user', 'comments', 'comments.user', 'updatedBy'],
            select: {
                id: true,
                title: true,
                content: true,
                created_at: true,
                updated_at: true,
                images: true,
                user: {
                    id: true,
                    username: true,
                    email: true,
                },
                updatedBy: {
                    id: true,
                    username: true,
                    email: true,
                },
                comments: {
                    id: true,
                    content: true,
                    created_at: true,
                    user: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }

    /* Create new article */
    create(
        data: { title: string; content: string; images?: string[] },
        author: User
    ): Promise<Article> {
        // Normalize image paths
        const normalizedImages = (data.images ?? []).map(img =>
            img.startsWith('articles/') ? img : `articles/${img}`
        );

        const article = this.articleRepo.create({
            title: data.title,
            content: data.content,
            images: normalizedImages,
            user: author,
        });

        return this.articleRepo.save(article);
    }

    /* Delete article with permission check and remove associated images */
    async delete(articleId: number, user: User) {
        const article = await this.articleRepo.findOne({
            where: { id: articleId },
            relations: ['user'],
        });

        if (!article) throw new NotFoundException('Article not found');

        if (article.user.id !== user.id && user.role !== 'admin') {
            throw new ForbiddenException('You cannot delete this article');
        }

        // Remove image files from disk
        (article.images || []).forEach((imgPath) => {
            const cleanFilename = imgPath.replace(/^articles\//, '');
            const filePath = path.join(process.cwd(), 'uploads', 'articles', cleanFilename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        await this.articleRepo.remove(article);
        return { message: 'Article deleted' };
    }

    /* Update article text fields and manage images */
    async update(
        id: number,
        data: { title?: string; content?: string; removeImages?: string },
        newFiles: Express.Multer.File[],
        user: User,
    ): Promise<Article> {
        const article = await this.articleRepo.findOne({ where: { id } });
        if (!article) throw new NotFoundException('Article not found');

        // Parse removeImages if provided
        let removeImages: string[] = [];
        if (data.removeImages) {
            try { removeImages = JSON.parse(data.removeImages); }
            catch { removeImages = []; }
        }

        article.images = article.images ?? [];

        // Delete removed images from disk and article.images array
        if (removeImages.length > 0) {
            for (const imgPath of removeImages) {
                const cleanFilename = imgPath.replace(/^articles\//, '');
                const filePath = path.join(process.cwd(), 'uploads', 'articles', cleanFilename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            article.images = article.images.filter(img => !removeImages.includes(img));
        }

        // Add new uploaded images
        if (newFiles && newFiles.length > 0) {
            const uploadedFilenames = newFiles.map(file => `articles/${file.filename}`);
            article.images = [...article.images, ...uploadedFilenames];
        }

        // Update text fields if provided
        if (data.title !== undefined) article.title = data.title;
        if (data.content !== undefined) article.content = data.content;

        article.updatedBy = user;
        article.updated_at = new Date();

        return this.articleRepo.save(article);
    }
}
