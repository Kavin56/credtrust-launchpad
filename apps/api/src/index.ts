import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as functions from 'firebase-functions';
import { ValidationPipe } from '@nestjs/common';
import multipart from '@fastify/multipart';

let fastifyInstance: any;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

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

  await app.register(multipart, {
    limits: { fileSize: 20 * 1024 * 1024, files: 5 },
    throwFileSizeLimit: true,
  });

  await app.init();
  const instance = app.getHttpAdapter().getInstance();
  await instance.ready();
  return instance;
}

export const credtrustApi = functions.https.onRequest(async (req, res) => {
  if (!fastifyInstance) {
    fastifyInstance = await bootstrap();
  }
  fastifyInstance.server.emit('request', req, res);
});
