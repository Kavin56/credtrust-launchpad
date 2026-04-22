import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import {
  ValidationPipe,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { existsSync } from 'fs';
import { cp, mkdir } from 'fs/promises';
import { resolve } from 'path';
import * as Sentry from '@sentry/node';

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const DEFAULT_UPLOAD_ROOT = resolve(process.cwd(), '../../uploads');
const LEGACY_UPLOAD_ROOT = resolve(process.cwd(), 'uploads');

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.2,
    });
  }
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  const logger = app.get(Logger);
  const uploadRoot = resolve(
    process.cwd(),
    process.env.LOCAL_UPLOAD_DIR || '../../uploads',
  );

  // Enable CORS for the frontend dev server
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.register(fastifyHelmet);
  await app.register(fastifyRateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(multipart, {
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 5 },
    throwFileSizeLimit: true,
  });
  await mkdir(uploadRoot, { recursive: true });
  if (
    uploadRoot === DEFAULT_UPLOAD_ROOT &&
    LEGACY_UPLOAD_ROOT !== uploadRoot &&
    existsSync(LEGACY_UPLOAD_ROOT)
  ) {
    await cp(LEGACY_UPLOAD_ROOT, uploadRoot, {
      recursive: true,
      force: false,
      errorOnExist: false,
    });
  }
  await app.register(fastifyStatic, {
    root: uploadRoot,
    prefix: '/uploads/',
  });

  app
    .getHttpAdapter()
    .getInstance()
    .setErrorHandler(
      (
        error: FastifyError,
        request: FastifyRequest,
        reply: FastifyReply,
      ) => {
        const code = (error as any)?.code;
        if (code === 'FST_REQ_FILE_TOO_LARGE') {
          logger.warn(
            `Upload rejected for ${request.url}: file exceeds ${MAX_UPLOAD_BYTES} bytes`,
          );
          return reply.status(413).send({
            statusCode: 413,
            error: 'Payload Too Large',
            message: 'File too large. Max 20 MB per file.',
          });
        }

        if (code?.startsWith?.('FST_')) {
          logger.warn(`Request failed for ${request.url}: ${error.message}`);
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: error.message || 'Invalid upload request.',
          });
        }

        throw error;
      },
    );

  const config = new DocumentBuilder()
    .setTitle('CredTrust API')
    .setDescription('Credit Cooperative Society Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen({ port: Number(port), host: '0.0.0.0' });
}

bootstrap();
