import { HttpService } from '@nestjs/axios';
import { v4 as uuid } from 'uuid';

import { ServerRequestContextModule } from './server-request-context.module';
import { ServerRequestContextService } from './server-request-context.service';

describe('ServerRequestContextModule', () => {
  describe('InterceptAxiosRequestsWithHeaders', () => {
    it('should call the "use" method', (done) => {
      const mockRequest = {
        headers: {
          common: {
            [uuid()]: uuid(),
            testOverwrite: '123'
          }
        }
      };
      const mockHttpService = {
        axiosRef: {
          interceptors: {
            request: {
              use: (handler) => {
                const result = handler(mockRequest);
                expect(result.headers.common).toEqual({
                  ...mockContextualHeaders,
                  ...mockRequest.headers.common
                });
                done();
              }
            }
          }
        }
      } as unknown as HttpService;
      const mockContextualHeaders = {
        [uuid()]: uuid(),
        testOverwrite: '456'
      };
      const mockServerRequestContextService = {
        contextualHeaders: () => mockContextualHeaders
      } as unknown as ServerRequestContextService;
      ServerRequestContextModule.InterceptAxiosRequestsWithHeaders(mockHttpService, mockServerRequestContextService);
    });
  });
});
