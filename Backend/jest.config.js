module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 15000,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/']
};