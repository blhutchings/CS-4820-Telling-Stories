import base from './jest.base.config.js';

export default {
    ...base,

    // The glob patterns Jest uses to detect test files
    testMatch: ['**/test/e2e/**/*.test.js'],
    testPathIgnorePatterns: []
};
