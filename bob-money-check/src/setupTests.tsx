// Jest setup file for Next.js App Router testing
import '@testing-library/jest-dom';

// Mock Next.js App Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  Router: {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock crypto.randomUUID
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {} as any;
}
globalThis.crypto.randomUUID = jest.fn(() => '12345678-1234-1234-1234-123456789012') as any;

// Mock window.location
delete (window as any).location;
window.location = { href: '', origin: 'http://localhost' } as any;

// Suppress specific Next.js warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: React.useMemo') ||
        args[0].includes('Warning: React.useEffect') ||
        args[0].includes('invariant'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
