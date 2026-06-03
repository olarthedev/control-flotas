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

    dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / returns 200', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('creates driver, vehicle, assigns vehicle and creates expense', async () => {
    const server = app.getHttpServer();

    const userResp = await request(server)
      .post('/users')
      .send({
        fullName: 'Test Driver',
        email: 'driver@example.com',
        password: 'password123',
        role: 'driver',
      });
    expect(userResp.status).toBe(201);
    const driverId = userResp.body.id;

    const vehicleResp = await request(server)
      .post('/vehicles')
      .send({ licensePlate: 'XYZ-123', brand: 'Test', model: 'Model', type: 'truck' });
    expect(vehicleResp.status).toBe(201);
    const vehicleId = vehicleResp.body.id;

    const assignResp = await request(server)
      .patch(`/users/${driverId}/assign-vehicle`)
      .send({ assignedVehicleId: vehicleId, assignmentChangeReason: 'Initial assignment' });
    expect(assignResp.status).toBe(200);

    const expenseResp = await request(server)
      .post('/expenses')
      .send({
        type: 'fuel',
        amount: 150000,
        expenseDate: new Date().toISOString(),
        driverId,
        vehicleId,
      });
    expect(expenseResp.status).toBe(201);
    expect(expenseResp.body.status).toBe('pending');

    const listResp = await request(server).get('/expenses');
    expect(listResp.status).toBe(200);
    expect(listResp.body.data).toHaveLength(1);
    expect(listResp.body.data[0].type).toBe('fuel');
  });

  it('creates trip and retrieves it from the list', async () => {
    const server = app.getHttpServer();

    const userResp = await request(server)
      .post('/users')
      .send({ fullName: 'Trip Driver', email: 'trip@example.com', password: 'password123', role: 'driver' });
    expect(userResp.status).toBe(201);
    const driverId = userResp.body.id;

    const vehicleResp = await request(server)
      .post('/vehicles')
      .send({ licensePlate: 'ABC-999', brand: 'Brand', model: 'Model', type: 'van' });
    expect(vehicleResp.status).toBe(201);
    const vehicleId = vehicleResp.body.id;

    const tripResp = await request(server)
      .post('/trips')
      .send({
        tripNumber: 'T-001',
        origin: 'Bogota',
        destination: 'Medellin',
        driverId,
        vehicleId,
      });
    expect(tripResp.status).toBe(201);

    const listResp = await request(server).get('/trips');
    expect(listResp.status).toBe(200);
    expect(Array.isArray(listResp.body)).toBe(true);
    expect(listResp.body).toHaveLength(1);
    expect(listResp.body[0].origin).toBe('Bogota');
  });
});
