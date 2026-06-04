const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: 'test-auth' } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: 'test-auth' } } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test-auth@example.com', password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test-auth@example.com', password: 'password123',
    });
    expect(res.status).toBe(409);
  });

  it('should reject invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'not-an-email', password: 'password123',
    });
    expect(res.status).toBe(400);
  });

  it('should reject short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test-auth2@example.com', password: '123',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test-auth@example.com', password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test-auth@example.com', password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('should reject unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com', password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});
