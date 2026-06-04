const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

let token;
let recipeId;

const testRecipe = {
  title: 'Test Jollof Rice',
  description: 'A delicious Nigerian classic',
  ingredients: [
    { name: 'rice', quantity: '2', unit: 'cups' },
    { name: 'tomatoes', quantity: '3', unit: 'medium' },
  ],
  instructions: ['Wash rice', 'Blend tomatoes', 'Cook together'],
  prepTime: 15, cookTime: 45, servings: 4, tags: ['nigerian', 'rice'],
};

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: 'test-recipes@example.com' } });
  const res = await request(app).post('/api/auth/register').send({
    name: 'Recipe Tester', email: 'test-recipes@example.com', password: 'password123',
  });
  token = res.body.accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: 'test-recipes@example.com' } });
  await prisma.$disconnect();
});

describe('Recipes CRUD', () => {
  it('POST /api/recipes - should create a recipe', async () => {
    const res = await request(app).post('/api/recipes').set('Authorization', `Bearer ${token}`).send(testRecipe);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe(testRecipe.title);
    recipeId = res.body.data.id;
  });

  it('GET /api/recipes - should return user recipes', async () => {
    const res = await request(app).get('/api/recipes').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('GET /api/recipes/:id - should return a single recipe', async () => {
    const res = await request(app).get(`/api/recipes/${recipeId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(recipeId);
  });

  it('PUT /api/recipes/:id - should update a recipe', async () => {
    const res = await request(app).put(`/api/recipes/${recipeId}`).set('Authorization', `Bearer ${token}`).send({ title: 'Updated Jollof Rice' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Jollof Rice');
  });

  it('GET /api/recipes - should support search', async () => {
    const res = await request(app).get('/api/recipes?search=jollof').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('DELETE /api/recipes/:id - should delete a recipe', async () => {
    const res = await request(app).delete(`/api/recipes/${recipeId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(401);
  });

  it('should return 404 for non-existent recipe', async () => {
    const res = await request(app).get('/api/recipes/00000000-0000-0000-0000-000000000000').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
