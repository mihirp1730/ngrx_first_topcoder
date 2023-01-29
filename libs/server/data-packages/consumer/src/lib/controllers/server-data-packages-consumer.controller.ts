import { DataPackage } from '@apollo/api/data-packages/consumer';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';

import { ServerDataPackagesConsumerService } from '../services/server-data-packages-consumer.service';

@Controller('consumer')
export class ServerDataPackagesConsumerController {

  constructor(public readonly serverDataPackagesConsumerService: ServerDataPackagesConsumerService) {
  }

  @Get('data-package/:dataPackageId')
  @GaiaTraceMethod
  public async getDataPackage(
    @Param('dataPackageId') dataPackageId: string
  ): Promise<DataPackage> {
    try {
      return await this.serverDataPackagesConsumerService.getDataPackage(dataPackageId);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException('An unknown error occurred.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
