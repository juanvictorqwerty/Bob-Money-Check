// Setup file for Jest tests
// This file runs before each test file

import '@testing-library/jest-dom';

// Mock Next.js navigation for App Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Only mock document and window for jsdom environment (React component tests)
if (typeof document !== 'undefined') {
  // Mock document.cookie
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });

  // Mock window.location
  delete (window as any).location;
  window.location = { href: '', origin: 'http://localhost' } as any;
}
