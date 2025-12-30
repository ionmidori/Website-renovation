// Learn more: https://github.com/testing-library/jest-dom
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
    },
    writable: true,
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock fetch
global.fetch = jest.fn();

// Mock TextDecoder
global.TextDecoder = jest.fn().mockImplementation(() => ({
    decode: jest.fn((value) => new TextDecoder().decode(value)),
}));

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
    readAsDataURL: jest.fn(),
    onloadend: null,
    onerror: null,
    result: null,
}));
