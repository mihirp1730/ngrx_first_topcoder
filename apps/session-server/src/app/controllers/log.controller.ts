import { ISauth } from '@apollo/server/jwt-token-middleware';
import { Interfaces } from '@apollo/server/services';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Body, Controller, HttpException, HttpStatus, Post, Session } from '@nestjs/common';
import { get, includes } from 'lodash';

import { LogService } from '../services/log.service';

@Controller('log')
export class LogController {

  constructor(private readonly logService: LogService) { }

  @Post('/error')
  @GaiaTraceMethod
  public async postError(
    @Session() sauth: ISauth,
    @Body() body: Interfaces.Api.Logging.PostErrorRequest,
  ): Promise<Interfaces.Api.Logging.PostErrorResponse> {
    const {subid} = sauth;

    // TO DO: Check wether all properties will be needed
    const message = get(body, 'message', undefined);
    const stack = get(body, 'stack', undefined);
    const timestamp = get(body, 'timestamp', undefined);
    const user = get(body, 'message', undefined);

    if (includes([message, stack, timestamp, user], undefined)) {
      throw new HttpException('An invalid body was provided', HttpStatus.BAD_REQUEST);
    }

    const payload = { message, stack, timestamp, user };
    const response = await this.logService.postError(subid, {payload});
    if (response.error) {
      throw new HttpException('An error ocurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      error: null
    }
  }

  @Post('/performance')
  @GaiaTraceMethod
  public async postPerformance(
    @Session() sauth: ISauth,
    @Body() body: Interfaces.Api.Logging.PostPerformanceRequest,
  ): Promise<Interfaces.Api.Logging.PostPerformanceResponse> {
    const {subid} = sauth;

    // TO DO: Check wether all properties will be needed
    const indicator = get(body, 'performanceIndicator', undefined);
    const latency = get(body, 'latency', undefined);

    if (includes([indicator, latency], undefined)) {
      throw new HttpException('An invalid body was provided', HttpStatus.BAD_REQUEST);
    }

    const payload = { indicator, latency };
    const response = await this.logService.postPerformance(subid, {payload});
    if (response.error) {
      throw new HttpException('An error ocurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return {
      error: null
    }
  }

}
