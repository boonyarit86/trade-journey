import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PgService } from './../src/database/pg.service';

describe('Strategy endpoints (e2e)', () => {
    let app: INestApplication;
    let createdStrategyId: string | undefined;
    const suffix = Date.now().toString().slice(-8);
    const strategyName = `Strat${suffix}`; // max ~13 chars, well within varchar(50)
    const strategyNameUpdated = `Upd${suffix}`;

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

    describe('/strategy (POST)', () => {
        it('should create a new strategy', () => {
            return request(app.getHttpServer())
                .post('/strategy')
                .send({
                    name: strategyName,
                    riskRewardRatio: 2,
                    riskPerTrade: 1,
                    description: 'e2e test strategy',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body.data).toHaveProperty('id');
                    createdStrategyId = response.body.data.id;
                });
        });

        it('should create a strategy with only name', () => {
            return request(app.getHttpServer())
                .post('/strategy')
                .send({ name: `Min${suffix}` })
                .expect(201)
                .then(async (response) => {
                    expect(response.body.data).toHaveProperty('id');
                    // clean up immediately
                    const pool = app.get(PgService).getPool();
                    await pool.query(
                        `DELETE FROM "trading_setup"."TD03_Strategy" WHERE "TD03_Id" = $1`,
                        [response.body.data.id],
                    );
                });
        });
    });

    describe('/strategy (GET)', () => {
        it('should return all strategies', () => {
            return request(app.getHttpServer())
                .get('/strategy')
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('total');
                    expect(response.body).toHaveProperty('data');
                    expect(Array.isArray(response.body.data)).toBe(true);
                    const strategy = response.body.data.find((s: any) => s.id === createdStrategyId);
                    expect(strategy).toBeDefined();
                    expect(strategy).toHaveProperty('checklists');
                    expect(Array.isArray(strategy.checklists)).toBe(true);
                });
        });
    });

    describe('/strategy/:id (GET)', () => {
        it('should return a single strategy with checklists array', () => {
            return request(app.getHttpServer())
                .get(`/strategy/${createdStrategyId}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.data).toHaveProperty('id');
                    expect(response.body.data.id).toBe(createdStrategyId);
                    expect(response.body.data).toHaveProperty('name');
                    expect(response.body.data).toHaveProperty('checklists');
                    expect(Array.isArray(response.body.data.checklists)).toBe(true);
                });
        });

        it('should fail when strategy does not exist', () => {
            return request(app.getHttpServer())
                .get('/strategy/00000000-0000-0000-0000-000000000000')
                .expect(500);
        });
    });

    describe('/strategy (PUT)', () => {
        it('should update a strategy', () => {
            return request(app.getHttpServer())
                .put('/strategy')
                .send({
                    id: createdStrategyId,
                    name: strategyNameUpdated,
                    riskRewardRatio: 3,
                    riskPerTrade: 2,
                    description: 'updated description',
                    isActive: true,
                })
                .expect(200)
                .then((response) => {
                    expect(response.body.data).toHaveProperty('id');
                    expect(response.body.data.name).toBe(strategyNameUpdated);
                });
        });
    });

    describe('/strategy/activeStatus (PUT)', () => {
        it('should update strategy active status', () => {
            return request(app.getHttpServer())
                .put('/strategy/activeStatus')
                .send({ id: createdStrategyId, isActive: false })
                .expect(200);
        });
    });

    describe('/strategy/:id (DELETE)', () => {
        it('should delete a strategy', () => {
            return request(app.getHttpServer())
                .delete(`/strategy/${createdStrategyId}`)
                .expect(200)
                .then(() => {
                    createdStrategyId = undefined;
                });
        });
    });
});
