import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule); // create Nest app
    app.useGlobalPipes(new ValidationPipe()); // enable validation globally
    app.enableCors(); // enable CORS

    // Serve uploaded files from /uploads URL
    app.use('/uploads', express.static(join(__dirname, '..', 'uploads'))); // static files

    await app.listen(3000); // start server on port 3000
}
bootstrap(); // bootstrap the app
