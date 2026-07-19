import request from 'supertest';
import app from '../app.js';
import { connectTestDB, closeTestDB } from './testDb.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

let category;

beforeAll(async () => {
  await connectTestDB();
  category = await Category.create({ name: 'Soup', icon: '🍲', slug: 'soup',});
  await Product.create({ name: 'Tomato Soup', price: 8.5, category: category._id });
});

afterAll(async () => {
  await closeTestDB();
});

describe('GET /api/menu', () => {
  it('returns categories', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBe(1);
    expect(res.body.categories[0].slug).toBe('soup');
  });
});

describe('GET /api/menu/:slug', () => {
  it('returns products for a category', async () => {
    const res = await request(app).get(`/api/menu/${category.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].name).toBe('Tomato Soup');
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/menu/does-not-exist');
    expect(res.status).toBe(404);
  });
});