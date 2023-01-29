module.exports = {
  displayName: 'content-server',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/content-server',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^axios$': require.resolve('@nestjs/axios')
  }
};
