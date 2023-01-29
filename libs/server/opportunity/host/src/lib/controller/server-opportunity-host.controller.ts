import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { IOpportunityRequests } from '../interfaces/interface';
import { ServerOpportunityHostService } from '../services/server-opportunity-host.service';

@Controller('host')
export class ServerOpportunityHostController {
  constructor(private serverOpportunityHostService: ServerOpportunityHostService) {}
  @Get('opportunity-subscription-request')
  @GaiaTraceMethod
  getOpportunitySubscriptionRequests(@Req() request: Request, @Res() response: Response): Promise<IOpportunityRequests> {
    const authorization = JwtTokenMiddleware.getToken(request);
    const vendorid = request.headers.vendorid || '';
    return this.serverOpportunityHostService
      .getOpportunitySubscriptionRequests(authorization, vendorid.toString(), request.host)
      .then((res: IOpportunityRequests) => {
        response.set({ 'correlation-id': res.header });
        response.send(res?.response);
        return res;
      });
  }
}
