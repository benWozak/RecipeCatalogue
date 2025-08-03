import '@testing-library/jest-dom'
import { beforeEach, afterEach, vi } from 'vitest'
import { mockAuth } from './test-utils'

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
  
  // Mock console methods to avoid noise in test output
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  // Clean up after each test
  mockAuth.reset()
  vi.restoreAllMocks()
})

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_CLERK_PUBLISHABLE_KEY: 'test-key',
    VITE_API_URL: 'http://localhost:8000',
    DEV: true,
    MODE: 'test',
  },
  writable: true,
})

// Mock window.matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ClipboardEvent for paste testing
global.ClipboardEvent = vi.fn().mockImplementation((type, eventInitDict) => {
  return new Event(type, eventInitDict)
})

// Mock DataTransfer for clipboard operations
global.DataTransfer = vi.fn().mockImplementation(() => ({
  getData: vi.fn(() => ''),
  setData: vi.fn(),
  clearData: vi.fn(),
  items: [],
  files: [],
  types: [],
}))