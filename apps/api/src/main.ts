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
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import * as Sentry from '@sentry/node';
import { initializeFirebaseAdmin } from './common/utils/firebase';

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

async function bootstrap() {
  initializeFirebaseAdmin();
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.2,
    });
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      bodyLimit: 100 * 1024 * 1024, // 100 MB body payload limit
    }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  const logger = app.get(Logger);
  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Enable CORS for the frontend dev server
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? corsOrigins : true,
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
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 100 },
    throwFileSizeLimit: true,
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

  app.getHttpAdapter().getInstance().get('/healthz', async () => ({ status: 'ok' }));
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Sharanam API')
      .setDescription('Credit Cooperative Society Management API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen({ port: Number(port), host: '0.0.0.0' });
}

bootstrap();
