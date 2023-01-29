import { FilterRequest, ResultsResponse } from '@apollo/api/data-packages/vendor';
import { BillingAccountId } from '@apollo/server/decorators/billing-account-id';
import { ISauth, JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Body, Controller, Patch, Req, Session } from '@nestjs/common';
import { Request } from 'express';

import { ServerDataPackagesVendorService } from '../services/server-data-packages-vendor.service';

@Controller('vendor')
export class ServerDataPackagesVendorController {

  constructor(
    public readonly serverDataPackagesVendorService: ServerDataPackagesVendorService
  ) {
  }

  @Patch('data-packages')
  @GaiaTraceMethod
  public async queryResults(
    @Req() request: Request,
    @Session() session: ISauth,
    @BillingAccountId({ required: true }) billingAccountId: string,
    @Body() filterRequest: FilterRequest
  ): Promise<ResultsResponse> {
    const authorization = JwtTokenMiddleware.getToken(request);
    return this.serverDataPackagesVendorService.queryResults(
      session.email,
      billingAccountId,
      authorization,
      filterRequest
    );
  }

}
