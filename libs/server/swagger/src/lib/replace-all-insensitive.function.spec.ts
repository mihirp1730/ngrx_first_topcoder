import { replaceAllInsensitive } from './replace-all-insensitive.function';

describe('Swagger utility functions', () => {
  describe('replaceAllInsensitive() function', () => {
    it('should call the corresponding spec version to Yaml converting function', async () => {
      const mock = 'x-service-$CONTAINER.endpoints.$PROJECT.cloud.goog';
      const replacementToken = 'z0-.';
      const expected = 'x-service-z0-.CONTAINER.endpoints.z0-.PROJECT.cloud.goog';

      const result = replaceAllInsensitive(mock, '$', replacementToken);

      expect(result).toBe(expected);
    });
  });
});
