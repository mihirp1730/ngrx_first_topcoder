import { AppHealthService } from '@apollo/app/health';
import { ISubscriptionIdentifier } from '@apollo/app/services/consumer-subscription';
import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Controller, Get, Headers, HttpException, HttpStatus, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { throwError } from 'rxjs';
import { Readable } from 'stream';

import { FileManagerService } from './file-manager/file-manager.service';
import { SubscriptionService } from './subscription/subscription.service';

@Controller('content')
export class AppController {
  constructor(
    public readonly subscriptionService: SubscriptionService,
    public readonly fileManagerService: FileManagerService,
    private readonly appHealthService: AppHealthService
  ) {}

  @Get('/opportunity/consumer/download/:fileName')
  @GaiaTraceMethod
  async getDownload(@Param('fileName') fileName: string, @Query('signedUrl') signedUrl: string, @Res() response: Response): Promise<void> {
    return this.getDownloadData(signedUrl, fileName, response);
  }

  @Get('health')
  @GaiaTraceMethod
  public getHealthCheck(@Headers('appKey') appKey: string): any {
    return this.appHealthService.healthCheck(appKey);
  }

  @Get('/download/:dataSubscriptionId/:billingAccountId/:dataItemId')
  @GaiaTraceMethod
  async get(
    @Req() request: Request,
    @Param('dataSubscriptionId') dataSubscriptionId: string,
    @Param('billingAccountId') billingAccountId: string,
    @Param('dataItemId') dataItemId: string,
    @Res() response: Response
  ): Promise<void> {
    return this.getData(
      request,
      {
        dataSubscriptionId,
        billingAccountId,
        dataItemId
      },
      response
    );
  }

  private async getData(request: Request, subscriptionIdentifier: ISubscriptionIdentifier, response: Response): Promise<void> {
    const token = JwtTokenMiddleware.getToken(request);
    const isSubscriptionExpired = await this.subscriptionService
      .isSubscriptionExpired(token, subscriptionIdentifier.dataSubscriptionId)
      .catch((error) => throwError(error));

    if (isSubscriptionExpired) {
      throw new HttpException(
        'The subscription for this data has expired. Please refresh the page to view the updated subscription status.',
        HttpStatus.GONE
      );
    }

    const fileInformation = await this.fileManagerService.getFileInformation(token, subscriptionIdentifier);

    // Using the file information, generate the correct stream of data.
    let fileStream: Readable;
    if (fileInformation.type === 'UrlFileInformation') {
      fileStream = await this.fileManagerService.getFileStreamFromUrl(fileInformation);
    } else {
      throw new HttpException('Unknown file type!', HttpStatus.NOT_IMPLEMENTED);
    }

    // The controller has the client's response object here in this method,
    // we must send the appropriate headers to the client.
    const { contentLength, filename } = fileInformation;
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.setHeader('Content-Length', contentLength.toString());
    fileStream.pipe(response);

    return this.handleHttpResponse(response);
  }

  private async getDownloadData(url: string, filename: string, response: Response): Promise<void> {
    const contentLength = await this.fileManagerService.getContentLength(url);
    const fileStream: Readable = await this.fileManagerService.getFileStreamFromUrl({
      type: 'UrlFileInformation',
      contentLength,
      filename,
      url
    });

    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.setHeader('Content-Length', contentLength.toString());
    fileStream.pipe(response);
    return this.handleHttpResponse(response);
  }

  private handleHttpResponse(response: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      response.on('finish', () => {
        resolve();
      });
      response.on('error', (error) => {
        console.error(error);
        reject('An error occurred providing the file...');
      });
    });
  }
}
