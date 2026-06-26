module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/apps'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: ['apps/**/src/**/*.{ts,tsx,js,jsx}', '!**/dist/**', '!**/node_modules/**'],
};
