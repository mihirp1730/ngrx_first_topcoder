module.exports = {
  displayName: 'metadata-server',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/metadata-server',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'testresults/apps/metadata-server',
        outputName: 'testresults.xml'
      }
    ]
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^axios$': require.resolve('@nestjs/axios')
  }
};
