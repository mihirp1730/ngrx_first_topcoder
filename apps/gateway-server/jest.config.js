module.exports = {
  displayName: 'gateway-server',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/gateway-server',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'testresults/apps/gateway-server',
        outputName: 'testresults.xml'
      }
    ]
  ],
  testEnvironment: 'node'
};
