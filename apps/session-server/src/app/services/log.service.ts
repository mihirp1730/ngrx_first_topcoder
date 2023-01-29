import { Interfaces } from '@apollo/server/services';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@GaiaTraceClass
export class LogService {
  constructor(private readonly logger: Logger) {}

  public async postError(
    subid: string,
    request: Interfaces.Api.Logging.PostErrorRequest
  ): Promise<Interfaces.Api.Logging.PostErrorResponse> {
    return this.logError(subid, request);
  }

  public async postPerformance(
    subid: string,
    request: Interfaces.Api.Logging.PostPerformanceRequest
  ): Promise<Interfaces.Api.Logging.PostPerformanceResponse> {
    return this.logError(subid, request);
  }

  private logError(
    subid: string,
    request: Interfaces.Api.Logging.PostErrorRequest | Interfaces.Api.Logging.PostPerformanceRequest
  ): Promise<Interfaces.Api.Logging.PostPerformanceResponse | Interfaces.Api.Logging.PostErrorResponse> {
    let error: null;
    try {
      this.logger.log(request.payload);
    } catch (e) {
      error = e.message;
    }
    return { error } as any;
  }
}
