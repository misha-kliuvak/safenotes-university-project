module.exports = {
  rootDir: '.',
  coverageDirectory: '../coverage',
  testRegex: ['.*\\.(spec)\\.ts$', '.*\\.(e2e-spec)\\.ts$'],
  transform: {
    '^.+\\.(t)s$': 'ts-jest',
    '^.+\\.tsx?$': 'babel-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  testEnvironment: 'node',
  testTimeout: 50000,
  testPathIgnorePatterns: [
    '<rootDir>/dist',
    '<rootDir>/ecosystem.config.js',
    '<rootDir>/db',
    '<rootDir>/mocks',
    '<rootDir>/src/lib',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/mock.ts',
    '^@mocks/(.*)$': '<rootDir>/mocks/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx', 'd.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/dist/lib',
    '<rootDir>/lib',
    '<rootDir>/src/lib/email-templates',
  ],
  globalTeardown: '<rootDir>/src/shared/jest/teardown.ts',
};
