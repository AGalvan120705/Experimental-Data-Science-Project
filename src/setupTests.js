import '@testing-library/jest-dom';
import { beforeAll, afterAll, vi } from 'vitest';

const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
    // Give Recharts deterministic non-zero dimensions in jsdom.
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        get() {
            return 900;
        },
    });

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get() {
            return 500;
        },
    });

    // Trigger ResizeObserver callback with valid dimensions.
    global.ResizeObserver = class {
        constructor(callback) {
            this.callback = callback;
        }

        observe(target) {
            this.callback([
                {
                    target,
                    contentRect: {
                        width: 900,
                        height: 500,
                    },
                },
            ]);
        }

        unobserve() { }

        disconnect() { }
    };

    // Silence known Recharts width/height warnings in jsdom only.
    console.warn = vi.fn((...args) => {
        const message = String(args[0] ?? '');
        if (message.includes('The width(') && message.includes('of chart should be greater than 0')) return;
        originalConsoleWarn(...args);
    });

    console.error = vi.fn((...args) => {
        const message = String(args[0] ?? '');
        if (message.includes('The width(') && message.includes('of chart should be greater than 0')) return;
        originalConsoleError(...args);
    });
});

afterAll(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
});