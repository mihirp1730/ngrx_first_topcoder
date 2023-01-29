import { ServerRequestContextMiddleware } from './server-request-context.middleware';

describe('ServerRequestContextMiddleware', () => {
  it('should provide a middleware signature', (done) => {
    const instance = new ServerRequestContextMiddleware();
    expect(instance.use).toBeTruthy();
    instance.use(null, null, done);
  });
});
