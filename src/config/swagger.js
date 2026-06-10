// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MealMate API',
      version: '1.0.0',
      description: 'Smart meal planning & recipe discovery API',
      contact: { name: 'MealMate Support' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://mealmateapi-2o77.onrender.com/api/docs', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Recipe: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            ingredients: { type: 'array', items: { type: 'object' } },
            instructions: { type: 'array', items: { type: 'string' } },
            prepTime: { type: 'integer' },
            cookTime: { type: 'integer' },
            servings: { type: 'integer' },
            tags: { type: 'array', items: { type: 'string' } },
            isPublic: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
