import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Asset endpoints (e2e)', () => {
  let app: INestApplication;
  let createdAssetTypeId: string;
  let createdAssetId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const assetTypeResponse = await request(app.getHttpServer())
      .post('/asset/type')
      .send({ name: 'Test Asset Type' })
      .expect(201);
    createdAssetTypeId = assetTypeResponse.body.data.id;
  });

  afterAll(async () => {
    if (createdAssetTypeId) {
      await request(app.getHttpServer())
        .delete(`/asset/type/${createdAssetTypeId}`)
        .expect(200);
    }
    await app.close();
  });

  describe('/asset (POST)', () => {
    it('should create a new asset', () => {
      return request(app.getHttpServer())
        .post('/asset')
        .send({
          name: 'XAUUSD',
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
          name: 'XAUUSD_UPDATED',
          assetTypeId: createdAssetTypeId,
          isActive: true,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.name).toBe('XAUUSD_UPDATED');
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
        .expect(200);
    });
  });
});
