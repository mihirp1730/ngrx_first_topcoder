module.exports = {
  displayName: 'server-data-packages-consumer',
  preset: '../../../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/server/data-packages/consumer',
  moduleNameMapper: {
    '^axios$': require.resolve('@nestjs/axios')
  }
};
