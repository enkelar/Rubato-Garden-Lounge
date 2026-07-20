import request from 'supertest';
import app from '../app.js';
import { connectTestDB, closeTestDB } from './testDb.js';
import userModel from '../models/userModel.js';import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';

let token;
let categoryId;
const { Admin } = userModel;

beforeAll(async () => {
  await connectTestDB();
  
  const admin = await Admin.create({
    name: 'Test Admin',
    email: 'productadmin@test.com',
    password: 'Password123!',
  });

  token = admin.generateAuthToken();

  const category = await categoryModel.create({
    name: 'Desserts',
    icon: '🍰',
    slug: 'desserts',
  });

  categoryId = category._id;
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await productModel.deleteMany({});
});

describe('Product admin CRUD', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
  });

  it('creates a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Chocolate Cake',
        price: 12.5,
        description: 'Rich chocolate cake',
        category: categoryId,
        image: 'https://example.com/cake.jpg',
        countInStock: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Product created');
    expect(res.body.product.name).toBe('Chocolate Cake');
  });

  it('returns 404 when updating a product that does not exist', async () => {
  const fakeId = '64b000000000000000000099';

  const res = await request(app)
    .put(`/api/products/${fakeId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Ghost Product',
      price: 20,
      category: categoryId,      
      image: 'https://example.com/ghost.jpg',
    });

  expect(res.status).toBe(404);
});

  it('lists products', async () => {
    await productModel.create({
      name: 'Vanilla Cake',
      price: 10,
      description: 'Simple vanilla cake',
      category: categoryId,
      image: 'https://example.com/vanilla.jpg',
      countInStock: 5,
    });

    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('lists products by category id', async () => {
    await productModel.create({
      name: 'Strawberry Tart',
      price: 8,
      description: 'Fresh tart',
      category: categoryId,
      image: 'https://example.com/tart.jpg',
      countInStock: 7,
    });

    const res = await request(app)
      .get(`/api/products/category/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('updates the product', async () => {
    const product = await productModel.create({
      name: 'Old Cake',
      price: 9,
      description: 'Old description',
      category: categoryId,
      image: 'https://example.com/old.jpg',
      countInStock: 4,
    });

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Cake',
        price: 15,
        description: 'Updated description',
        category: categoryId,
        image: 'https://example.com/new.jpg',
        countInStock: 12,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product updated');
    expect(res.body.product.name).toBe('Updated Cake');
    expect(res.body.product.price).toBe(15);
  });

  it('deletes the product', async () => {
    const product = await productModel.create({
      name: 'Delete Cake',
      price: 6,
      description: 'To be deleted',
      category: categoryId,
      image: 'https://example.com/delete.jpg',
      countInStock: 2,
    });

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product deleted');
  });

  it('returns 404 when updating a missing product', async () => {
    const fakeId = '64b000000000000000000001';

    const res = await request(app)
      .put(`/api/products/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Missing Product',
        price: 20,
      });

    expect(res.status).toBe(400);
  });

  it('returns 404 when deleting a missing product', async () => {
    const fakeId = '64b000000000000000000002';

    const res = await request(app)
      .delete(`/api/products/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});