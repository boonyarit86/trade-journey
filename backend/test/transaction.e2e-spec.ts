import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PgService } from './../src/database/pg.service';

describe('Transaction endpoints (e2e)', () => {
    let app: INestApplication;
    let projectId: string;
    let assetTypeId: string;
    let assetId: string;
    let portfolioId: string;

    const suffix = Date.now().toString().slice(-8);
    const projectName = `TxProj${suffix}`;
    const assetTypeName = `TxType${suffix}`;
    const assetName = `TXA${suffix}`;
    const portfolioName = `TxPort${suffix}`;
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

        const portfolioRes = await request(app.getHttpServer())
            .post('/portfolio')
            .send({ name: portfolioName, projectId, assetId, initBalance })
            .expect(201);
        portfolioId = portfolioRes.body.data.id;
    });

    afterAll(async () => {
        try {
            const pool = app.get(PgService).getPool();
            if (portfolioId) {
                await pool.query(`DELETE FROM "transaction"."TS01_Transaction" WHERE "TD05_Id" = $1`, [portfolioId]);
                await pool.query(`DELETE FROM "trading_setup"."TD05_Portfolio" WHERE "TD05_Id" = $1`, [portfolioId]);
            }
            await Promise.all([
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

    describe('/transaction (POST)', () => {
        it('should create a win transaction and increase portfolio balance and win stats', async () => {
            const createRes = await request(app.getHttpServer())
                .post('/transaction')
                .send({ portfolioId, amount: 200, fees: 10, resultValue: 'W' })
                .expect(201);
            expect(createRes.body.data).toHaveProperty('id');

            const portfolioRes = await request(app.getHttpServer())
                .get(`/portfolio/${portfolioId}`)
                .expect(200);
            expect(portfolioRes.body.data.currentBalance).toBe(1200);
            expect(Number(portfolioRes.body.data.totalWinTrade)).toBe(1);
            expect(Number(portfolioRes.body.data.totalTrade)).toBe(1);
            expect(Number(portfolioRes.body.data.winRatePercent)).toBe(100);
            expect(portfolioRes.body.data.cm05Value).toBe('W');
        });

        it('should create a loss transaction and decrease portfolio balance', async () => {
            await request(app.getHttpServer())
                .post('/transaction')
                .send({ portfolioId, amount: 100, resultValue: 'L' })
                .expect(201);

            const portfolioRes = await request(app.getHttpServer())
                .get(`/portfolio/${portfolioId}`)
                .expect(200);
            expect(portfolioRes.body.data.currentBalance).toBe(1100);
            expect(Number(portfolioRes.body.data.totalLossTrade)).toBe(1);
            expect(Number(portfolioRes.body.data.winRatePercent)).toBe(50);
            expect(portfolioRes.body.data.cm05Value).toBe('L');
        });

        it('should create a break-even transaction without changing balance', async () => {
            await request(app.getHttpServer())
                .post('/transaction')
                .send({ portfolioId, amount: 0, resultValue: 'B' })
                .expect(201);

            const portfolioRes = await request(app.getHttpServer())
                .get(`/portfolio/${portfolioId}`)
                .expect(200);
            expect(portfolioRes.body.data.currentBalance).toBe(1100);
            expect(Number(portfolioRes.body.data.totalBreakEven)).toBe(1);
            expect(Number(portfolioRes.body.data.totalTrade)).toBe(3);
            expect(portfolioRes.body.data.cm05Value).toBe('B');
        });

        it('should reject a loss larger than the current balance with 400', () => {
            return request(app.getHttpServer())
                .post('/transaction')
                .send({ portfolioId, amount: 999999, resultValue: 'L' })
                .expect(400);
        });

        it('should reject an invalid result value with 400', () => {
            return request(app.getHttpServer())
                .post('/transaction')
                .send({ portfolioId, amount: 100, resultValue: 'X' })
                .expect(400);
        });
    });

    describe('/transaction (GET)', () => {
        it('should return transactions filtered by portfolioId with joined data', () => {
            return request(app.getHttpServer())
                .get(`/transaction?portfolioId=${portfolioId}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('total');
                    expect(Array.isArray(response.body.data)).toBe(true);
                    expect(response.body.data.length).toBeGreaterThanOrEqual(3);
                    const first = response.body.data[0];
                    expect(first.portfolioName).toBe(portfolioName);
                    expect(first).toHaveProperty('resultValue');
                });
        });
    });
});
