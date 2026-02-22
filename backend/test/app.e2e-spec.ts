import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // reset database between tests
    dataSource = app.get(DataSource);
    await dataSource.synchronize(true); // drop & recreate schema
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should create user, vehicle and trip and then retrieve metrics', async () => {
    const server = app.getHttpServer();

    // create a driver
    const userResp = await request(server)
      .post('/users')
      .send({ fullName: 'Test Driver', email: 'driver@example.com', role: 'DRIVER', isActive: true });
    expect(userResp.status).toBe(201);
    const userId = userResp.body.id;

    // create a vehicle
    const vehicleResp = await request(server)
      .post('/vehicles')
      .send({ licensePlate: 'XYZ123', brand: 'Test', model: 'Model', year: 2020, driverId });
    expect(vehicleResp.status).toBe(201);
    const vehicleId = vehicleResp.body.id;

    // create a trip
    const tripResp = await request(server)
      .post('/trips')
      .send({ tripNumber: 'T100', startDate: '2026-02-22', driverId, vehicleId });
    expect(tripResp.status).toBe(201);

    // GET trips
    const listResp = await request(server).get('/trips');
    expect(listResp.status).toBe(200);
    expect(Array.isArray(listResp.body)).toBe(true);
    expect(listResp.body.length).toBe(1);

    // metrics should report 1 user, 1 vehicle, 1 trip
    const metricsResp = await request(server).get('/metrics');
    expect(metricsResp.status).toBe(200);
    expect(metricsResp.body).toMatchObject({ users: 1, vehicles: 1, trips: 1 });
  });
});
