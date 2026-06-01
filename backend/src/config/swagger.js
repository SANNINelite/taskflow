const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API - Scalable Task Management Engine',
      version: '1.0.0',
      description: 'A professional internship-grade task management system API featuring JWT authentication, Role-Based Access Control, request validation, and comprehensive MongoDB models.',
      contact: {
        name: 'Technical Assessment Committee Support',
      },
    },
    servers: [
      {
        url: 'https://taskflow-ndcp.onrender.com',
        description: 'Production Server',
      },
      {
        url: 'http://localhost:5000',
        description: 'Local Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT in the format: <Token_Value>. Do NOT prefix it with "Bearer " - the UI does that automatically.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b2bad041234' },
            name: { type: 'string', example: 'Alice Smith' },
            email: { type: 'string', example: 'alice@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-06-01T12:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-06-01T12:05:00.000Z' },
          },
        },
        Task: {
          type: 'object',
          required: ['title'],
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b2bad045678' },
            title: { type: 'string', example: 'Complete system architecture plan' },
            description: { type: 'string', example: 'Flesh out scalability diagrams, cache policies, and horizontal scaling strategies' },
            status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], example: 'pending' },
            createdBy: { type: 'string', example: '60c72b2f9b1d8b2bad041234' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-06-01T12:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-06-01T12:05:00.000Z' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description message' },
            errors: { type: 'array', items: { type: 'string' }, example: ['Specific field errors, if any'] },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/app.js'], // Point to where Swagger specs are written as comments
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('[Documentation] Swagger UI available at http://localhost:5000/api-docs');
};

module.exports = setupSwagger;
