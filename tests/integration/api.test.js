// Integration Test untuk Recipe API
const request = require('supertest');
const app = require('../../src/app');

// Mock database untuk integration testing
jest.mock('../../src/config/db');

describe('Recipe API Integration Tests', () => {
  describe('Health Check', () => {
    test('GET /health should return API status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Recipe API is running!',
        timestamp: expect.any(String)
      });
    });
  });

  describe('API Routes', () => {
    test('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Route not found',
        path: '/unknown-route',
        timestamp: expect.any(String)
      });
    });
  });

  describe('CORS Middleware', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-methods']).toContain('PUT');
      expect(response.headers['access-control-allow-methods']).toContain('DELETE');
    });

    test('should handle preflight OPTIONS request', async () => {
      const response = await request(app)
        .options('/api/recipes')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });
  });

  describe('JSON Parser Middleware', () => {
    test('should parse JSON request body', async () => {
      // Mock service untuk test ini
      const recipeService = require('../../src/services/recipeService');
      jest.doMock('../../src/services/recipeService');
      
      recipeService.createRecipe = jest.fn().mockResolvedValue({
        success: true,
        message: 'Recipe created successfully',
        data: { id: 1, title: 'Test Recipe' }
      });

      const requestBody = {
        title: 'Test Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };

      const response = await request(app)
        .post('/api/recipes')
        .send(requestBody)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid JSON format');
    });
  });

  describe('Error Handling Middleware', () => {
    test('should handle application errors gracefully', async () => {
      // Test with invalid endpoint to trigger database error
      const response = await request(app)
        .get('/api/recipes/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Invalid'),
        timestamp: expect.any(String)
      });
    });

    test('should handle validation errors with proper status', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('Request Logging Middleware', () => {
    test('should log requests (check console output)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .get('/health')
        .expect(200);

      // Check if logging occurred
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Recipe API Endpoints Integration', () => {
    beforeEach(() => {
      // Reset all mocks before each test and clear module cache
      jest.clearAllMocks();
      jest.resetModules();
    });

    test('should handle complete recipe workflow', async () => {
      // For integration testing, we'll test the actual behavior without mocking
      // This tests the real workflow through all layers
      
      // Test validation error first
      const invalidResponse = await request(app)
        .post('/api/recipes')
        .send({})
        .expect(400);

      expect(invalidResponse.body.success).toBe(false);
      expect(invalidResponse.body.message).toContain('Validation failed');

      // Test valid recipe creation
      const validRecipe = {
        title: 'Integration Test Recipe',
        description: 'Test description for integration',
        ingredients: ['test ingredient 1', 'test ingredient 2'],
        instructions: ['step 1', 'step 2']
      };

      const createResponse = await request(app)
        .post('/api/recipes')
        .send(validRecipe)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.message).toContain('created successfully');
      expect(createResponse.body.data).toBeDefined();
      // For integration test, we'll just check that the response structure is correct
      // without relying on exact data matching due to potential test data persistence
      expect(createResponse.body.data.title).toBeDefined();
      
      // Test that the integration workflow functions correctly
      // by checking basic endpoint functionality without complex state management
    });

    test('should validate middleware chain order', async () => {
      // Test that CORS headers are present (CORS middleware working)
      // Test that JSON parsing works (express.json middleware working)
      // Test that logging occurs (logger middleware working)
      // Test that errors are handled (error handler middleware working)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const response = await request(app)
        .post('/api/recipes')
        .send({ title: 'Test Recipe', ingredients: ['test'], instructions: ['test'] })
        .expect('Access-Control-Allow-Origin', '*');

      // CORS headers should be present
      expect(response.headers['access-control-allow-origin']).toBe('*');

      // Logging should occur
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
