import { AppHealthService } from '@apollo/app/health';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Controller, Get, Headers, Param } from '@nestjs/common';

import { GatewayPayload, GatewayService } from '../services/gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService, private readonly appHealthService: AppHealthService) {}

  @Get('health')
  @GaiaTraceMethod
  public getHealthCheck(@Headers('appKey') appKey: string): any {
    return this.appHealthService.healthCheck(appKey);
  }
}
