const nxPreset = require('@nrwl/jest/preset');
const esModules = ['@angular', '@ngrx', '@delfi-gui', '.*.mjs$'].join('|');

module.exports = {
  ...nxPreset,
  collectCoverage: true,
  coverageReporters: ['lcov', 'cobertura', 'html'],
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    }
  }
};
