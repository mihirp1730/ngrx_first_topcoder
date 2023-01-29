module.exports = {
  displayName: 'server-jwt-token-validation-middleware',
  preset: '../../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/server/jwt-token-validation-middleware',
  moduleNameMapper: {
    '^axios$': require.resolve('@nestjs/axios')
  }
};
