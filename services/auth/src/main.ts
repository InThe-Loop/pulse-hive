import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('PulseHiveAuth');
    const app = await NestFactory.create(AppModule);
    const port = Number(process.env.PORT ?? 4001);

    const allowedOrigins = (
        process.env.CORS_ORIGINS ??
        'http://localhost:3000,http://127.0.0.1:3000'
    )
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.enableCors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    await app.listen(port, '0.0.0.0');
    logger.log(`Auth service running on: ${await app.getUrl()}`);
}

bootstrap();
