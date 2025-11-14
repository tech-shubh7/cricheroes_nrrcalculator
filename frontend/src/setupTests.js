// src/setupTests.js
import '@testing-library/jest-dom';

// Suppress console errors during tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};