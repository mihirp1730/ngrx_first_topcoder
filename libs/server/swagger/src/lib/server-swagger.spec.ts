jest.mock('./server-swagger');

import * as _imported from './server-swagger';
const mocked = _imported as any;
const actual = jest.requireActual('./server-swagger');

import { SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as convertFns from './convert.functions';

describe('Swagger', () => {
  describe('setupSwagger() main function', () => {
    it("shouldn't do anything when app wasn't launched with `swagger-build` argv or `SWAGGER_UI=on` env variable", () => {
      mocked.buildSwaggerFile.mockReturnValue(Promise.resolve());

      actual.setupSwagger(null, {} as any);

      expect(mocked.buildSwaggerFile.mock.calls.length).toBe(0);
      expect(mocked.setupSwaggerUI.mock.calls.length).toBe(0);
    });

    it('should call buildSwaggerFile() function and process.exit() when app launched with `swagger-build` argv', async () => {
      const originalArgv = process.argv;
      const buildTriggerArgv = 'swagger-build';
      process.argv = [...process.argv, buildTriggerArgv];
      const mockedExit = jest.spyOn(process, 'exit').mockImplementationOnce((() => {undefined}) as any);

      const mockApp = null;
      const mockAppSpecDoc = {} as any;
      const mockBuildFilePath = './build/deploy/swagger.yaml';
      mocked.buildSwaggerFile.mockReturnValue(Promise.resolve());

      await actual.setupSwagger(mockApp, mockAppSpecDoc, {
        buildTriggerArgv,
        buildFilePath: mockBuildFilePath
      });

      expect(mocked.buildSwaggerFile).toHaveBeenCalledTimes(1);
      expect(mocked.buildSwaggerFile).toHaveBeenCalledWith(mockAppSpecDoc, mockBuildFilePath);
      mocked.buildSwaggerFile.mockReset();
      expect(mockedExit).toHaveBeenCalledTimes(1);
      mockedExit.mockRestore();
      process.argv = originalArgv;
    });

    it('should console error and exit with error code 1 when call to buildSwaggerFile() function throws', async () => {
      const originalArgv = process.argv;
      const buildTriggerArgv = 'swagger-build';
      process.argv = [...process.argv, buildTriggerArgv];
      const mockedExit = jest.spyOn(process, 'exit').mockImplementationOnce((() => {undefined}) as any);
      const mockConsoleErr = jest.spyOn(console, 'error').mockImplementation((() => {undefined}) as any);

      const mockApp = null;
      const mockAppSpecDoc = {} as any;
      const mockBuildFilePath = './build/deploy/swagger.yaml';
      const mockError = 'Error';
      mocked.buildSwaggerFile.mockReturnValue(Promise.reject(mockError));

      await actual.setupSwagger(mockApp, mockAppSpecDoc, {
        buildTriggerArgv,
        buildFilePath: mockBuildFilePath
      });

      expect(mocked.buildSwaggerFile).toHaveBeenCalledTimes(1);
      expect(mocked.buildSwaggerFile).toHaveBeenCalledWith(mockAppSpecDoc, mockBuildFilePath);
      mocked.buildSwaggerFile.mockReset();
      expect(mockConsoleErr).toHaveBeenCalledTimes(1);
      expect(mockConsoleErr).toHaveBeenCalledWith(mockError);
      mockConsoleErr.mockRestore();
      expect(mockedExit).toHaveBeenCalledTimes(1);
      expect(mockedExit).toHaveBeenCalledWith(1);
      mockedExit.mockRestore();
      process.argv = originalArgv;
    });

    it('should call setupSwaggerUI() function when app launched with env variable `SWAGGER_UI=on`', async () => {
      const originalEnv = process.env;
      process.env = { ...process.env, SWAGGER_UI: 'on' };

      const mockApp = null;
      const mockAppSpecDoc = {} as any;
      const mockSwaggerUiPath = './build/deploy/swagger.yaml';

      await actual.setupSwagger(mockApp, mockAppSpecDoc, {
        swaggerUiPath: mockSwaggerUiPath
      });

      expect(mocked.setupSwaggerUI).toHaveBeenCalledTimes(1);
      expect(mocked.setupSwaggerUI).toHaveBeenCalledWith(mockApp, mockAppSpecDoc, mockSwaggerUiPath);
      mocked.setupSwaggerUI.mockReset();
      process.env = originalEnv;
    });
  });

  describe('setupSwaggerUI() function', () => {
    it('should call SwaggerModule.setup() and app.getHttpAdapter().get() for the yaml version endpoint setup', () => {
      const mockedSetup = jest.spyOn(SwaggerModule, 'setup').mockImplementationOnce((() => {undefined}) as any);
      const mockGet = jest.fn();
      const mockApp = {
        getHttpAdapter: jest.fn(() => ({
          get: mockGet
        }))
      };
      const mockSpecDoc = {} as any;
      const mockPath = '';

      actual.setupSwaggerUI(mockApp as any, mockSpecDoc, mockPath);

      expect(SwaggerModule.setup).toHaveBeenCalledTimes(1);
      expect(mockedSetup.mock.calls[0][0]).toBe(mockPath);
      expect(mockedSetup.mock.calls[0][1]).toBe(mockApp);
      expect(mockedSetup.mock.calls[0][2]).toBe(mockSpecDoc);
      mockedSetup.mockRestore();
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should send a Yaml type response', done => {
      const mockedSetup = jest.spyOn(SwaggerModule, 'setup').mockImplementationOnce((() => {undefined}) as any);
      const mockYamlStr = 'foo';
      const mockedconvert3to2 = jest.spyOn(convertFns, 'convert3to2YamlStr').mockImplementationOnce(async () => mockYamlStr);
      const mockGet = jest.fn();
      const mockApp = {
        getHttpAdapter: jest.fn(() => ({
          get: mockGet
        }))
      };
      const mockSpecDoc = {} as any;
      const mockPath = 'mock';
      mockGet.mockImplementation(async (path, middlewareCallback) => {
        expect(path).toBe(`${mockPath}-yaml`);

        const mockResponse = { type: jest.fn(), send: jest.fn() };
        await middlewareCallback(null, mockResponse);
        expect(mockResponse.type).toHaveBeenCalledWith('.yaml');
        expect(mockResponse.send).toHaveBeenCalledTimes(1);
        expect(mockResponse.send).toHaveBeenCalledWith(Buffer.from(mockYamlStr));
        mockedconvert3to2.mockRestore();
        done();
      });

      actual.setupSwaggerUI(mockApp as any, mockSpecDoc, mockPath);

      mockedSetup.mockRestore();
    });
  });

  describe('setupSwaggerUI() function', () => {
    it('should convert the specDoc and write the result to filesystem', async () => {
      const mockYamlStr = 'foo';
      const mockedConvertSpecToYaml = jest.spyOn(convertFns, 'convertSpecObjToYamlStr').mockImplementationOnce(async () => {
        return mockYamlStr;
      });
      const mockedWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementationOnce((() => {undefined}) as any);
      const mockSpecDoc = {};
      const mockFilePath = '.';

      await actual.buildSwaggerFile(mockSpecDoc, mockFilePath);

      expect(mockedConvertSpecToYaml).toHaveBeenCalledWith(mockSpecDoc);
      mockedConvertSpecToYaml.mockRestore();
      expect(mockedWriteFileSync).toHaveBeenCalledWith(mockFilePath, mockYamlStr);
      mockedWriteFileSync.mockRestore();
    });
  });
});
