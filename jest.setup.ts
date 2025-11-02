// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock window.matchMedia

Object.defineProperty(window, 'matchMedia', {
  writable: true,

  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de IntersectionObserver

global.IntersectionObserver = class IntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
} as any;

// Mock de ResizeObserver

global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
} as any;

// Mock localStorage
let store: Record<string, string> = {};

const getItemImpl = (key: string) => store[key] || null;
const setItemImpl = (key: string, value: string) => {
  store[key] = value.toString();
};
const removeItemImpl = (key: string) => {
  delete store[key];
};
const clearImpl = () => {
  store = {};
};

const getItemMock = jest.fn(getItemImpl);
const setItemMock = jest.fn(setItemImpl);
const removeItemMock = jest.fn(removeItemImpl);
const clearMock = jest.fn(clearImpl);

global.localStorage = {
  getItem: getItemMock,
  setItem: setItemMock,
  removeItem: removeItemMock,
  clear: clearMock,
} as any;

// Clear mocks and store before each test
beforeEach(() => {
  store = {};
  getItemMock.mockClear().mockImplementation(getItemImpl);
  setItemMock.mockClear().mockImplementation(setItemImpl);
  removeItemMock.mockClear().mockImplementation(removeItemImpl);
  clearMock.mockClear().mockImplementation(clearImpl);
});

// Suppress console errors/warnings in tests (optional)

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Add TextEncoder and TextDecoder for MUI DataGrid compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
