import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';

export interface GatewayPayload {
  message: string;
}

@Injectable()
@GaiaTraceClass
export class GatewayService {
  // remove the below, this is just initial code,
  // it is only for demonstrations...
  getData(endpoint?: string): GatewayPayload {
    if (endpoint) {
      endpoint = `The "${endpoint}" endpoint!`;
    }
    return {
      message: `Welcome to gateway-server! ${endpoint}`
    };
  }
}
