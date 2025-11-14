// src/services/__tests__/api.test.js
// Since the API uses axios.create() directly in the module, we test the exported functions
// without full integration mocking

describe('Frontend API Service - Function Exports', () => {
  test('should have fetchPointsTable export available', () => {
    // Dynamic import to avoid axios issues
    const apiModule = require('../api');
    expect(typeof apiModule.fetchPointsTable).toBe('function');
  });

  test('should have simulateExactMatch export available', () => {
    const apiModule = require('../api');
    expect(typeof apiModule.simulateExactMatch).toBe('function');
  });

  test('should have calculateMatch export available', () => {
    const apiModule = require('../api');
    expect(typeof apiModule.calculateMatch).toBe('function');
  });

  test('should have default API export', () => {
    const apiModule = require('../api');
    expect(apiModule.default).toBeDefined();
  });
});
