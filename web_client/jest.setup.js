/**
 * Jest Setup - Global Test Configuration
 * Configures testing environment, mocks, and extends Jest matchers
 */

// ✅ PILLAR 1 FIX: Properly import testing-library matchers
// This extends Jest's expect() with custom matchers like toBeInTheDocument()
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};

    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock visualViewport for mobile tests
Object.defineProperty(window, 'visualViewport', {
    value: {
        height: 800,
        width: 375,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    },
    writable: true,
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();
window.scrollTo = jest.fn();

// Mock fetch with smart endpoint handling
global.fetch = jest.fn((input) => {
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input?.url || '');

    // Auto-handle history endpoint to prevent useEffect failures
    if (url.includes('/api/chat/history')) {
        return Promise.resolve({
            ok: true,
            json: async () => ({ messages: [] }),
        });
    }

    // Default mock for other endpoints
    return Promise.resolve({
        ok: true,
        body: {
            getReader: () => ({
                read: jest.fn().mockResolvedValue({ done: true, value: undefined }),
            }),
        },
    });
});

// Polyfill TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
    readAsDataURL: jest.fn(),
    onloadend: null,
    onerror: null,
    result: null,
}));

