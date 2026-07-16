import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PgService } from './../src/database/pg.service';

describe('Asset endpoints (e2e)', () => {
  let app: INestApplication;
  let createdAssetTypeId: string;
  let createdAssetId: string | undefined;
  const suffix = Date.now().toString().slice(-8);
  const assetTypeName = `Type${suffix}`; // max 12 chars
  const assetName = `XAU${suffix}`; // max 11 chars
  const assetNameUpdated = `UPD${suffix}`; // max 11 chars

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const assetTypeResponse = await request(app.getHttpServer())
      .post('/asset/type')
      .send({ name: assetTypeName })
      .expect(201);
    createdAssetTypeId = assetTypeResponse.body.data.id;
  });

  afterAll(async () => {
    try {
      const pool = app.get(PgService).getPool();
      if (createdAssetId) {
        await pool.query(
          `DELETE FROM "common"."CM02_Asset" WHERE "CM02_Id" = $1`,
          [createdAssetId],
        );
      }
      if (createdAssetTypeId) {
        await pool.query(
          `DELETE FROM "common"."CM01_AssetType" WHERE "CM01_Id" = $1`,
          [createdAssetTypeId],
        );
      }
    } catch {
      // ignore cleanup errors
    }
  });

  describe('/asset (POST)', () => {
    it('should create a new asset', () => {
      return request(app.getHttpServer())
        .post('/asset')
        .send({
          name: assetName,
          assetTypeId: createdAssetTypeId,
        })
        .expect(201)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          createdAssetId = response.body.data.id;
        });
    });

    it('should fail when asset type does not exist', () => {
      return request(app.getHttpServer())
        .post('/asset')
        .send({
          name: 'INVALID',
          assetTypeId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(500);
    });
  });

  describe('/asset (GET)', () => {
    it('should return all assets', () => {
      return request(app.getHttpServer())
        .get('/asset')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('total');
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
  });

  describe('/asset/:id (GET)', () => {
    it('should return a single asset', () => {
      return request(app.getHttpServer())
        .get(`/asset/${createdAssetId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.id).toBe(createdAssetId);
          expect(response.body.data).toHaveProperty('name');
          expect(response.body.data).toHaveProperty('assetTypeName');
        });
    });

    it('should fail when asset does not exist', () => {
      return request(app.getHttpServer())
        .get('/asset/00000000-0000-0000-0000-000000000000')
        .expect(500);
    });
  });

  describe('/asset (PUT)', () => {
    it('should update an asset', () => {
      return request(app.getHttpServer())
        .put('/asset')
        .send({
          id: createdAssetId,
          name: assetNameUpdated,
          assetTypeId: createdAssetTypeId,
          isActive: true,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.name).toBe(assetNameUpdated);
        });
    });
  });

  describe('/asset/activeStatus (PUT)', () => {
    it('should update asset active status', () => {
      return request(app.getHttpServer())
        .put('/asset/activeStatus')
        .send({
          id: createdAssetId,
          isActive: false,
        })
        .expect(200);
    });
  });

  describe('/asset/:id (DELETE)', () => {
    it('should delete an asset', () => {
      return request(app.getHttpServer())
        .delete(`/asset/${createdAssetId}`)
        .expect(200)
        .then(() => {
          createdAssetId = undefined;
        });
    });
  });
});
