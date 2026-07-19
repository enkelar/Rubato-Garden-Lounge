import request from 'supertest';
import app from '../app.js';
import { connectTestDB, closeTestDB } from './testDb.js';
import userModel from '../models/userModel.js';

const { Admin } = userModel;

beforeAll(async () => {
  await connectTestDB();
  await Admin.create({ name: 'Test Admin', email: 'admin@test.com', password: 'Password123!' });
});

afterAll(async () => {
  await closeTestDB();
});

describe('POST /api/auth/login', () => {
  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.admin.email).toBe('admin@test.com');
  });
});