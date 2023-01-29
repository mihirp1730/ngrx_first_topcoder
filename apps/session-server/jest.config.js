module.exports = {
  displayName: 'session-server',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/session-server',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'testresults/apps/session-server',
        outputName: 'testresults.xml'
      }
    ]
  ],
  testEnvironment: 'node'
};
