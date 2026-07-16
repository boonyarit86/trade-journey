import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PgService } from './../src/database/pg.service';

describe('Checklist endpoints (e2e)', () => {
  let app: INestApplication;
  let createdChecklistId: string | undefined;
  const suffix = Date.now().toString().slice(-8);
  const checklistName = `Check${suffix}`;
  const checklistNameUpdated = `Upd${suffix}`;

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
      if (createdChecklistId) {
        await pool.query(
          `DELETE FROM "trading_setup"."TD02_Checklist" WHERE "TD02_Id" = $1`,
          [createdChecklistId],
        );
      }
    } catch {
      // ignore cleanup errors
    }
    await app.close();
  });

  describe('/checklist (POST)', () => {
    it('should create a new checklist', () => {
      return request(app.getHttpServer())
        .post('/checklist')
        .send({
          name: checklistName,
        })
        .expect(201)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          createdChecklistId = response.body.data.id;
        });
    });
  });

  describe('/checklist (GET)', () => {
    it('should return all checklists', () => {
      return request(app.getHttpServer())
        .get('/checklist')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('total');
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
  });

  describe('/checklist/:id (GET)', () => {
    it('should return a single checklist', () => {
      return request(app.getHttpServer())
        .get(`/checklist/${createdChecklistId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.id).toBe(createdChecklistId);
          expect(response.body.data).toHaveProperty('name');
          expect(response.body.data).toHaveProperty('isRequired');
          expect(response.body.data).toHaveProperty('isActive');
        });
    });

    it('should fail when checklist does not exist', () => {
      return request(app.getHttpServer())
        .get('/checklist/00000000-0000-0000-0000-000000000000')
        .expect(500);
    });
  });

  describe('/checklist (PUT)', () => {
    it('should update a checklist', () => {
      return request(app.getHttpServer())
        .put('/checklist')
        .send({
          id: createdChecklistId,
          name: checklistNameUpdated,
          isRequired: true,
          isActive: true,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.name).toBe(checklistNameUpdated);
          expect(response.body.data.isRequired).toBe(true);
        });
    });
  });

  describe('/checklist/activeStatus (PUT)', () => {
    it('should update checklist active status', () => {
      return request(app.getHttpServer())
        .put('/checklist/activeStatus')
        .send({
          id: createdChecklistId,
          isActive: false,
        })
        .expect(200);
    });
  });

  describe('/checklist/:id (DELETE)', () => {
    it('should delete a checklist', () => {
      return request(app.getHttpServer())
        .delete(`/checklist/${createdChecklistId}`)
        .expect(200)
        .then(() => {
          createdChecklistId = undefined;
        });
    });
  });
});
