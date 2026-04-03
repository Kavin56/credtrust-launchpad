import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('App E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST) unauthorized', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@test.com', password: 'invalid123' })
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
