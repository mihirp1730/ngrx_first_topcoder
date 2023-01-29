import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import * as jwt_decode from 'jwt-decode';

import { ServerOpportunityAttendeeService } from '../services/server-opportunity-attendee.service';

@Controller('attendee')
export class ServerOpportunityAttendeeController {
  constructor(private serverOpportunityAttendeeService: ServerOpportunityAttendeeService) {}

  @Get('opportunities/:opportunityId')
  @GaiaTraceMethod
  getOpportunity(@Req() request: Request, @Param('opportunityId') opportunityId: string): any {
    const authorization = JwtTokenMiddleware.getToken(request);
    const userId = jwt_decode(authorization).email;
    return this.serverOpportunityAttendeeService.getOpportunity(authorization, userId, opportunityId, request);
  }
}
