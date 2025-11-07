import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

/**
 * Example Integration Test
 *
 * Integration tests verify that multiple components work together.
 * They test API contracts, service interactions, and database operations.
 *
 * Note: Integration tests require a test database connection.
 * Set DATABASE_URL environment variable to your Supabase test project.
 */
describe('API Integration Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same global configurations as main.ts
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /api/health should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('Root Endpoint', () => {
    it('GET / should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  // Example: Test API endpoint with database interaction
  // Uncomment and modify when you have actual endpoints to test
  /*
  describe('User API', () => {
    it('POST /api/users should create a user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userData.email);
    });
  });
  */
});
