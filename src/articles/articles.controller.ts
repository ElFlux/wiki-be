import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    ParseIntPipe,
    NotFoundException,
    UseGuards,
    Req,
    Delete,
    Patch,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ArticlesService } from './articles.service';
import { Article } from './articles.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/users.entity';

/* Controller for articles endpoints */
@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    /* Get all articles */
    @Get()
    findAll(): Promise<Article[]> {
        return this.articlesService.findAll();
    }

    /* Get single article by ID */
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Article> {
        const article = await this.articlesService.findOne(id);
        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }
        return article;
    }

    /* Create a new article (auth required) */
    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FilesInterceptor('images', 10, {
        storage: diskStorage({
            destination: './uploads/articles', // Folder for uploads
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `article-image-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    create(
        @Body() body: { title: string; content: string },
        @Req() req: Request,
        @UploadedFiles() files?: Express.Multer.File[],
    ): Promise<Article> {
        const user = req.user as User;
        const data: any = { ...body };

        if (files && files.length > 0) {
            data.images = files.map(file => `articles/${file.filename}`); // Store relative paths
        }

        return this.articlesService.create(data, user);
    }

    /* Delete an article by ID (auth required) */
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.articlesService.delete(id, req.user);
    }

    /* Update an article (auth required) */
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @UseInterceptors(FilesInterceptor('images', 10, {
        storage: diskStorage({
            destination: './uploads/articles', // Folder for uploads
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `article-image-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any, // May include title, content, removeImages
        @Req() req: Request,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const user = req.user as User;
        return this.articlesService.update(id, body, files ?? [], user);
    }
}
