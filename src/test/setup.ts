/**
 * Vitest setup file for VS Code extension testing
 * This file runs before all tests and sets up the testing environment
 */

import { afterAll, beforeAll } from 'vitest'

beforeAll(() => {
  // Set up any global test configuration
  process.env.NODE_ENV = 'test'

  // Suppress console.log during tests unless explicitly needed
  const originalConsoleLog = console.log
  console.log = (...args: unknown[]) => {
    if (process.env.VITEST_VERBOSE === 'true') {
      originalConsoleLog(...args)
    }
  }
})

afterAll(() => {
  // Clean up after all tests
})
