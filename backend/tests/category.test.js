import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connectTestDB, closeTestDB } from './testDb.js';
import userModel from '../models/userModel.js';

let token;
const { Admin } = userModel;

beforeAll(async () => {
  await connectTestDB();
  const admin = await Admin.create({ name: 'Test Admin', email: 'catadmin@test.com', password: 'Password123!' });
  token = admin.generateAuthToken();
});

afterAll(async () => {
  await closeTestDB();
});

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake.test.token'),
  verify: jest.fn(() => ({ _id: '123', isAdmin: true })),
}));

describe('Category admin CRUD', () => {
  let categoryId;

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(401);
  });

  it('creates a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Desserts', slug: 'desserts', icon: '🍰' });
    expect(res.status).toBe(201);
    expect(res.body.category.slug).toBe('desserts');
    categoryId = res.body.category._id;
  });

  it('lists categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBeGreaterThan(0);
  });

  it('deletes the category', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});