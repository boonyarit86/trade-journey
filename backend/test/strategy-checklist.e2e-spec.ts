import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PgService } from './../src/database/pg.service';

describe('StrategyChecklist endpoints (e2e)', () => {
    let app: INestApplication;
    let createdStrategyId: string | undefined;
    let checklistId: string | undefined;
    const suffix = Date.now().toString().slice(-8);
    const strategyName = `SCStrat${suffix}`;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        const pool = app.get(PgService).getPool();

        // Create a strategy to use in tests
        const strategyResponse = await request(app.getHttpServer())
            .post('/strategy')
            .send({ name: strategyName })
            .expect(201);
        createdStrategyId = strategyResponse.body.data.id;

        // Get an existing checklist from seeded data
        const checklistResult = await pool.query(
            `SELECT "TD02_Id" FROM "trading_setup"."TD02_Checklist" LIMIT 1`
        );
        if (checklistResult.rows.length === 0) {
            throw new Error('No checklist seed data found. Run migrations first.');
        }
        checklistId = checklistResult.rows[0].TD02_Id;
    });

    afterAll(async () => {
        try {
            const pool = app.get(PgService).getPool();
            if (createdStrategyId && checklistId) {
                await pool.query(
                    `DELETE FROM "trading_setup"."TD04_StrategyChecklist" WHERE "TD03_Id" = $1`,
                    [createdStrategyId],
                );
            }
            if (createdStrategyId) {
                await pool.query(
                    `DELETE FROM "trading_setup"."TD03_Strategy" WHERE "TD03_Id" = $1`,
                    [createdStrategyId],
                );
            }
        } catch {
            // ignore cleanup errors
        }
    });

    describe('/strategy-checklist (POST)', () => {
        it('should create a strategy-checklist link without providing isRequired (defaults from checklist)', () => {
            return request(app.getHttpServer())
                .post('/strategy-checklist')
                .send({ strategyId: createdStrategyId, checklistId })
                .expect(201)
                .then((response) => {
                    expect(response.body.data).toHaveProperty('strategyId');
                    expect(response.body.data).toHaveProperty('checklistId');
                    expect(response.body.data.strategyId).toBe(createdStrategyId);
                    expect(response.body.data.checklistId).toBe(checklistId);
                });
        });

        it('should fail when strategy does not exist', () => {
            return request(app.getHttpServer())
                .post('/strategy-checklist')
                .send({
                    strategyId: '00000000-0000-0000-0000-000000000000',
                    checklistId,
                })
                .expect(500);
        });

        it('should fail when checklist does not exist', () => {
            return request(app.getHttpServer())
                .post('/strategy-checklist')
                .send({
                    strategyId: createdStrategyId,
                    checklistId: '00000000-0000-0000-0000-000000000000',
                })
                .expect(500);
        });
    });

    describe('/strategy-checklist (GET)', () => {
        it('should return all strategy-checklist links', () => {
            return request(app.getHttpServer())
                .get('/strategy-checklist')
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('total');
                    expect(response.body).toHaveProperty('data');
                    expect(Array.isArray(response.body.data)).toBe(true);
                });
        });
    });

    describe('/strategy-checklist/:strategyId (GET)', () => {
        it('should return links for the created strategy', () => {
            return request(app.getHttpServer())
                .get(`/strategy-checklist/${createdStrategyId}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('total');
                    expect(response.body).toHaveProperty('data');
                    expect(response.body.data.length).toBeGreaterThan(0);
                    expect(response.body.data[0].strategyId).toBe(createdStrategyId);
                });
        });
    });

    describe('/strategy-checklist (PUT)', () => {
        it('should update the strategy-checklist link', () => {
            return request(app.getHttpServer())
                .put('/strategy-checklist')
                .send({
                    strategyId: createdStrategyId,
                    checklistId,
                    isActive: false,
                    isRequired: true,
                })
                .expect(200)
                .then((response) => {
                    expect(response.body.data).toHaveProperty('strategyId');
                    expect(response.body.data.isActive).toBe(false);
                    expect(response.body.data.isRequired).toBe(true);
                });
        });
    });

    describe('/strategy-checklist/activeStatus (PUT)', () => {
        it('should update active status of the link', () => {
            return request(app.getHttpServer())
                .put('/strategy-checklist/activeStatus')
                .send({
                    strategyId: createdStrategyId,
                    checklistId,
                    isActive: true,
                })
                .expect(200);
        });
    });

    describe('/strategy/:id after linking checklist (GET)', () => {
        it('should return strategy with checklists array populated', () => {
            return request(app.getHttpServer())
                .get(`/strategy/${createdStrategyId}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.data.checklists).toHaveLength(1);
                    expect(response.body.data.checklists[0].checklistId).toBe(checklistId);
                });
        });
    });

    describe('/strategy-checklist/:strategyId/:checklistId (DELETE)', () => {
        it('should delete the strategy-checklist link', () => {
            return request(app.getHttpServer())
                .delete(`/strategy-checklist/${createdStrategyId}/${checklistId}`)
                .expect(200);
        });
    });
});
