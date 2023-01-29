import { HttpModule, HttpService } from '@nestjs/axios';
import { Module, OnModuleInit } from '@nestjs/common';

import { ServerRequestContextMiddleware } from './server-request-context.middleware';
import { ServerRequestContextModel } from './server-request-context.model';
import { ServerRequestContextService } from './server-request-context.service';
import * as tokens from './server-request-context.tokens';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: tokens.SERVER_REQUEST_CONTEXT_FACTORY_TOKEN,
      useValue: () => ServerRequestContextModel.currentContext()
    },
    ServerRequestContextMiddleware,
    ServerRequestContextService
  ],
  exports: [ServerRequestContextMiddleware, ServerRequestContextService]
})
export class ServerRequestContextModule implements OnModuleInit {
  static InterceptAxiosRequestsWithHeaders(httpService: HttpService, serverRequestContextService: ServerRequestContextService): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    httpService.axiosRef.interceptors.request.use((req: any) => {
      const headers = serverRequestContextService.contextualHeaders();
      // Start by spreading the contextual headers first, then
      // use any developer or consumer-provided headers after.
      // This will give priority to the provided headers.

      req.headers.common = {
        ...headers,
        ...req.headers.common
      };
      return req;
    });
  }

  /* istanbul ignore next */
  constructor(private readonly serverRequestContextService: ServerRequestContextService, private httpService: HttpService) {}

  /* istanbul ignore next */
  public onModuleInit() {
    ServerRequestContextModule.InterceptAxiosRequestsWithHeaders(this.httpService, this.serverRequestContextService);
  }
}
