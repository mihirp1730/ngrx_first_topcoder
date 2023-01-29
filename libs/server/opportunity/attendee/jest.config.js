module.exports = {
  displayName: 'server-opportunity-attendee',
  preset: '../../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/server/opportunity/attendee',
  moduleNameMapper: {
    '^axios$': require.resolve('@nestjs/axios')
  }
};
