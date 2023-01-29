import { RequestValidationMiddleware } from './request-validation.middleware';

describe('RequestValidationMiddleware', () => {
  describe('create', () => {
    it('should return a function that creates middleware', () => {
      const result = RequestValidationMiddleware('service', {});
      expect(result).toBeTruthy();
      expect(result).toBeInstanceOf(Function);
      const middlewareInstance = new result();
      expect(middlewareInstance).toBeTruthy();
    });
  });
});
