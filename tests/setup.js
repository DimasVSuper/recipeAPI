// Test setup file
// This file runs before all tests

// Set test environment
process.env.NODE_ENV = 'test';

// Mock database untuk testing
jest.mock('../src/config/db', () => {
  return {
    query: jest.fn(),
  };
});

// Global test helpers
global.mockRecipeData = {
  id: 1,
  title: 'Test Recipe',
  description: 'Test description',
  ingredients: ['ingredient1', 'ingredient2'],
  instructions: ['step1', 'step2'],
  created_at: new Date('2025-06-30T00:00:00.000Z'),
  updated_at: new Date('2025-06-30T00:00:00.000Z')
};

global.mockDbResult = [
  {
    id: 1,
    title: 'Test Recipe',
    description: 'Test description',
    ingredients: '["ingredient1", "ingredient2"]',
    instructions: '["step1", "step2"]',
    created_at: new Date('2025-06-30T00:00:00.000Z'),
    updated_at: new Date('2025-06-30T00:00:00.000Z')
  }
];

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Console warning untuk test environment
console.log('🧪 Test environment loaded');
