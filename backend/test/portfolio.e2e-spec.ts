import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PgService } from './../src/database/pg.service';

describe('Portfolio endpoints (e2e)', () => {
    let app: INestApplication;
    let projectId: string;
    let assetTypeId: string;
    let assetId: string;
    let strategyId: string;
    let createdPortfolioId: string | undefined;

    const suffix = Date.now().toString().slice(-8);
    const projectName = `Proj${suffix}`;
    const assetTypeName = `Type${suffix}`;
    const assetName = `XAU${suffix}`;
    const strategyName = `Strat${suffix}`;
    const portfolioName = `Port${suffix}`;
    const portfolioNameUpdated = `Upd${suffix}`;
    const initBalance = 1000;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        const projectRes = await request(app.getHttpServer())
            .post('/project')
            .send({ name: projectName })
            .expect(201);
        projectId = projectRes.body.data.id;

        const assetTypeRes = await request(app.getHttpServer())
            .post('/asset/type')
            .send({ name: assetTypeName })
            .expect(201);
        assetTypeId = assetTypeRes.body.data.id;

        const assetRes = await request(app.getHttpServer())
            .post('/asset')
            .send({ name: assetName, assetTypeId })
            .expect(201);
        assetId = assetRes.body.data.id;

        const strategyRes = await request(app.getHttpServer())
            .post('/strategy')
            .send({ name: strategyName, riskRewardRatio: 2, riskPerTrade: 1 })
            .expect(201);
        strategyId = strategyRes.body.data.id;
    });

    afterAll(async () => {
        try {
            const pool = app.get(PgService).getPool();
            if (createdPortfolioId) {
                await pool.query(`DELETE FROM "trading_setup"."TD05_Portfolio" WHERE "TD05_Id" = $1`, [createdPortfolioId]);
            }
            await Promise.all([
                strategyId
                    ? pool.query(`DELETE FROM "trading_setup"."TD03_Strategy" WHERE "TD03_Id" = $1`, [strategyId])
                    : Promise.resolve(),
                assetId
                    ? pool.query(`DELETE FROM "common"."CM02_Asset" WHERE "CM02_Id" = $1`, [assetId])
                    : Promise.resolve(),
                projectId
                    ? pool.query(`DELETE FROM "trading_setup"."TD01_Project" WHERE "TD01_Id" = $1`, [projectId])
                    : Promise.resolve(),
            ]);
            if (assetTypeId) {
                await pool.query(`DELETE FROM "common"."CM01_AssetType" WHERE "CM01_Id" = $1`, [assetTypeId]);
            }
        } catch {
            // ignore cleanup errors
        }
    }, 60000);

    describe('/portfolio (POST)', () => {
        it('should create a new portfolio and set current balance to init balance', () => {
            return request(app.getHttpServer())
                .post('/portfolio')
                .send({
                    name: portfolioName,
                    projectId,
                    assetId,
                    strategyId,
                    initBalance,
                    description: 'e2e test portfolio',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body.data).toHaveProperty('id');
                    createdPortfolioId = response.body.data.id;
                });
        });

        it('should fail with 400 when required fields are missing', () => {
            return request(app.getHttpServer())
                .post('/portfolio')
                .send({ name: 'Missing fields' })
                .expect(400);
        });

        it('should fail when project does not exist', () => {
            return request(app.getHttpServer())
                .post('/portfolio')
                .send({
                    name: `Bad${suffix}`,
                    projectId: '00000000-0000-0000-0000-000000000000',
                    assetId,
                    initBalance,
                })
                .expect(500);
        });
    });

    describe('/portfolio (GET)', () => {
        it('should return all portfolios joined with project, asset, asset type, and strategy', () => {
            return request(app.getHttpServer())
                .get('/portfolio')
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('total');
                    expect(response.body).toHaveProperty('data');
                    expect(Array.isArray(response.body.data)).toBe(true);

                    const portfolio = response.body.data.find((p: any) => p.id === createdPortfolioId);
                    expect(portfolio).toBeDefined();
                    expect(portfolio.projectName).toBe(projectName);
                    expect(portfolio.assetName).toBe(assetName);
                    expect(portfolio.assetTypeName).toBe(assetTypeName);
                    expect(portfolio.strategyName).toBe(strategyName);
                    expect(portfolio.initBalance).toBe(initBalance);
                    expect(portfolio.currentBalance).toBe(initBalance);
                });
        });
    });

    describe('/portfolio/:id (GET)', () => {
        it('should return a single portfolio with joined names', () => {
            return request(app.getHttpServer())
                .get(`/portfolio/${createdPortfolioId}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.data.id).toBe(createdPortfolioId);
                    expect(response.body.data.projectName).toBe(projectName);
                    expect(response.body.data.assetName).toBe(assetName);
                    expect(response.body.data.assetTypeName).toBe(assetTypeName);
                    expect(response.body.data.strategyName).toBe(strategyName);
                });
        });

        it('should fail when portfolio does not exist', () => {
            return request(app.getHttpServer())
                .get('/portfolio/00000000-0000-0000-0000-000000000000')
                .expect(500);
        });
    });

    describe('/portfolio (PUT)', () => {
        it('should update a portfolio', () => {
            return request(app.getHttpServer())
                .put('/portfolio')
                .send({
                    id: createdPortfolioId,
                    name: portfolioNameUpdated,
                    projectId,
                    assetId,
                    strategyId,
                    initBalance: 1500,
                    description: 'updated description',
                    isActive: true,
                })
                .expect(200)
                .then((response) => {
                    expect(response.body.data).toHaveProperty('id');
                    expect(response.body.data.name).toBe(portfolioNameUpdated);
                });
        });
    });

    describe('/portfolio/activeStatus (PUT)', () => {
        it('should update portfolio active status', () => {
            return request(app.getHttpServer())
                .put('/portfolio/activeStatus')
                .send({ id: createdPortfolioId, isActive: false })
                .expect(200);
        });
    });

    describe('/portfolio/:id (DELETE)', () => {
        it('should delete a portfolio', () => {
            return request(app.getHttpServer())
                .delete(`/portfolio/${createdPortfolioId}`)
                .expect(200)
                .then(() => {
                    createdPortfolioId = undefined;
                });
        });
    });
});
