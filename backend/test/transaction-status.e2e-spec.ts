import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PgService } from './../src/database/pg.service';

describe('TransactionStatus endpoints (e2e)', () => {
  let app: INestApplication;
  let createdId: string | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    try {
      const pool = app.get(PgService).getPool();
      if (createdId) {
        await pool.query(
          `DELETE FROM "common"."CM03_TransactionStatus" WHERE "CM03_Id" = $1`,
          [createdId],
        );
      }
    } catch {
      // ignore cleanup errors
    }
    await app.close();
  });

  describe('/transaction-status (POST)', () => {
    it('should create a new transaction status', () => {
      return request(app.getHttpServer())
        .post('/transaction-status')
        .send({ text: 'test-status', value: 'TST', colorCode: '#ffffff' })
        .expect(201)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          createdId = response.body.data.id;
        });
    });
  });

  describe('/transaction-status (GET)', () => {
    it('should return all transaction statuses', () => {
      return request(app.getHttpServer())
        .get('/transaction-status')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('total');
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
  });

  describe('/transaction-status/:id (GET)', () => {
    it('should return a single transaction status', () => {
      return request(app.getHttpServer())
        .get(`/transaction-status/${createdId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.id).toBe(createdId);
          expect(response.body.data).toHaveProperty('text');
          expect(response.body.data).toHaveProperty('value');
          expect(response.body.data).toHaveProperty('colorCode');
          expect(response.body.data).toHaveProperty('isActive');
        });
    });

    it('should fail when transaction status does not exist', () => {
      return request(app.getHttpServer())
        .get('/transaction-status/00000000-0000-0000-0000-000000000000')
        .expect(500);
    });
  });

  describe('/transaction-status (PUT)', () => {
    it('should update a transaction status', () => {
      return request(app.getHttpServer())
        .put('/transaction-status')
        .send({
          id: createdId,
          text: 'test-updated',
          value: 'TUP',
          colorCode: '#000000',
          isActive: true,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.text).toBe('test-updated');
        });
    });
  });

  describe('/transaction-status/activeStatus (PUT)', () => {
    it('should update active status', () => {
      return request(app.getHttpServer())
        .put('/transaction-status/activeStatus')
        .send({ id: createdId, isActive: false })
        .expect(200);
    });
  });
});
