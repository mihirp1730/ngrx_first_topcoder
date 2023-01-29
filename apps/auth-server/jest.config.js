module.exports = {
  displayName: 'auth-server',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/auth-server',
  // Needed for manipulate Http requests and catch them with nock.
  testEnvironment: 'node',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'testresults/apps/auth-server',
        outputName: 'testresults.xml'
      }
    ]
  ],
  moduleNameMapper: {
    '^axios$': require.resolve('@nestjs/axios')
  }
};
