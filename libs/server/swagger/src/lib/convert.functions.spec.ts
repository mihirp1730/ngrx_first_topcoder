import * as apiSpecConverter from 'api-spec-converter';
import * as convertFns from './convert.functions';

describe('Swagger convert functions', () => {
  describe('convertSpecObjToYamlStr() function', () => {
    it('should call the corresponding spec version to Yaml converting function', async () => {
      const mockResultV3 = 'v3';
      const mockResultV2 = 'v2';
      const mockedConvertV3 = jest.spyOn(convertFns, 'convert3to2YamlStr').mockImplementation(async () => mockResultV3);
      const mockedConvertV2 = jest.spyOn(convertFns, 'convertJsonToYamlStr').mockImplementation(() => mockResultV2);

      expect(await convertFns.convertSpecObjToYamlStr({ openapi: '3.0' })).toBe(mockResultV3);
      expect(await convertFns.convertSpecObjToYamlStr({ swagger: '2.0' })).toBe(mockResultV2);
      mockedConvertV3.mockRestore();
      mockedConvertV2.mockRestore();
    });
  });

  describe('convertJsonToYamlStr() function', () => {
    it('should convert a JSON to a Yaml string', async () => {
      const mockJson = { openapi: '3.0' };
      const expectedYamlStr = `openapi: '3.0'`;
      expect(convertFns.convertJsonToYamlStr(mockJson)).toMatch(expectedYamlStr);
    });
  });

  describe('convert3to2YamlStr() function', () => {
    it('should convert a JSON of v3 to v2 with intact "host" shell variables ($ prefixed)', async () => {
      const mockV3Json = {
        openapi: '3.0.0',
        servers: [{ url: 'https://x-service-$CONTAINER.endpoints.$PROJECT.cloud.goog' }]
      };
      const replacementToken = 'z0-.';
      // The object returned by `api-spec-converted` has host with all letters in lowercase.
      const mockV2JsonConverted = {
        openapi: '2.0',
        host: 'x-service-z0-.container.endpoints.z0-.project.cloud.goog'
      };
      const mockV2JsonFinal = {
        openapi: '2.0',
        host: 'x-service-$CONTAINER.endpoints.$PROJECT.cloud.goog',
        consumes: ['application/json'],
        produces: ['application/json']
      };
      const mockStringifiedResult = 'foo';
      const mockConvertedObj = {
        spec: mockV2JsonConverted,
        stringify: jest.fn(() => mockStringifiedResult)
      };
      // We need to mock the `apiSpecConverter.convert()` call as it uses runtime requires for formats
      //  and those doesn't seems friendly with jest.
      const mockedConvertFn = jest.spyOn(apiSpecConverter, 'convert').mockImplementation(async () => mockConvertedObj);

      const resultV2YamlStr = await convertFns.convert3to2YamlStr(mockV3Json, replacementToken);

      expect(mockedConvertFn).toHaveBeenCalledTimes(1);
      mockedConvertFn.mockRestore();
      expect(mockConvertedObj.spec).toEqual(mockV2JsonFinal);
      expect(mockConvertedObj.stringify).toHaveBeenCalledTimes(1);
      expect(resultV2YamlStr).toMatch(mockStringifiedResult);
    });

    it('should throw error when called and `api-spec-converter` dependency is not installed', async () => {
      // jest.resetModules();
      jest.setMock('api-spec-converter', undefined);
      

      let error: Error;
      try {
        await convertFns.convert3to2YamlStr(null);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(Error);
    });
  });
});
