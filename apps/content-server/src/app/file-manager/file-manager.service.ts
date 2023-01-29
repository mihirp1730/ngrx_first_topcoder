import { HttpErrorResponse } from '@angular/common/http';
import { ISubscriptionIdentifier } from '@apollo/app/services/consumer-subscription';
import { GaiaTraceClass } from '@apollo/tracer';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { Readable } from 'node:stream';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type FileInformationTypes = UrlFileInformation;

export type UrlFileInformation = {
  type: 'UrlFileInformation';
  contentLength: number;
  filename: string;
  url: string;
};

type FileManagerRequestConfig = {
  headers: {
    authorization: string;
    billingaccountid?: string;
  };
};

@Injectable()
@GaiaTraceClass
export class FileManagerService {
  static CONSUMER_SUBSCRIPTION_SERVICE_TOKEN = 'CONSUMER_SUBSCRIPTION_SERVICE_TOKEN';
  static OSDU_FILE_MANAGER_URL_TOKEN = 'OSDU_FILE_MANAGER_URL_TOKEN';
  constructor(
    public readonly httpService: HttpService,
    @Inject(FileManagerService.CONSUMER_SUBSCRIPTION_SERVICE_TOKEN) public readonly consumerSubscriptionUrl: string,
    @Inject(FileManagerService.OSDU_FILE_MANAGER_URL_TOKEN) public readonly osduFileManagerUrl: string
  ) {}

  public async getFileInformation(accessToken: string, subscriptionIdentifier: ISubscriptionIdentifier): Promise<FileInformationTypes> {
    const config = {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    };
    if (subscriptionIdentifier.billingAccountId) {
      config.headers = { ...config.headers, ...{ billingaccountid: subscriptionIdentifier.billingAccountId } };
    }
    const type = 'UrlFileInformation';

    let dataItemId = subscriptionIdentifier.dataItemId;
    if (isEmpty(dataItemId)) {
      dataItemId = await this.getDataItemId(subscriptionIdentifier.dataSubscriptionId, config);
    }

    const filename = await this.getFileName(dataItemId, config);
    const url = await this.getSignedUrl(dataItemId, config);
    const contentLength = await this.getContentLength(url);

    return { type, contentLength, filename, url };
  }

  private async getDataItemId(dataSubscriptionId: string, config: FileManagerRequestConfig): Promise<string> {
    const subscriptionUrl = `${this.consumerSubscriptionUrl}/consumer/data-subscriptions/${dataSubscriptionId}/data-items`;
    const subscriptionResponse = await this.httpService
      .get(subscriptionUrl, config)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('error: ', err, ' while returning dataItemId from subscriptionUrl: subscriptionUrl: ', subscriptionUrl);
          return of(null);
        })
      )
      .toPromise();

    if (!subscriptionResponse) {
      throw new HttpException('Data Item not found', HttpStatus.NOT_FOUND);
    }

    return subscriptionResponse.data.items[0].dataItemId;
  }

  private async getFileName(dataItemId: string, config: FileManagerRequestConfig): Promise<string> {
    const nameUrl = `${this.osduFileManagerUrl}/file-manager/data-files/${dataItemId}`;
    const responseName = await this.httpService
      .get(nameUrl, config)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('error while retrieving file name from url: ', nameUrl, ' with error: ', err);
          return of(null);
        })
      )
      .toPromise();

    if (!responseName) {
      throw new HttpException('File name not found', HttpStatus.NOT_FOUND);
    }

    return responseName.data.fileName;
  }

  private async getSignedUrl(dataItemId: string, config: FileManagerRequestConfig): Promise<string> {
    const fileUrl = `${this.osduFileManagerUrl}/file-manager/data-files/${dataItemId}/download`;
    const response = await this.httpService
      .get(fileUrl, config)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('error:', err, ' while getting download with fileUrl: ', fileUrl, ' for data item: ', dataItemId);
          return of(null);
        })
      )
      .toPromise();

    if (!response) {
      throw new HttpException('File URL not found', HttpStatus.NOT_FOUND);
    }

    return response.data.signedURL;
  }

  public async getContentLength(url: string): Promise<number> {
    const { headers } = await this.httpService
      .head(url)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('error: ', error, ' while getting the content lenght for url: ', url);
          return of({ headers: null });
        })
      )
      .toPromise();

    if (!headers) {
      throw new HttpException('Length not found', HttpStatus.NOT_FOUND);
    }

    return Number(headers['content-length']);
  }

  public async getFileStreamFromUrl(fileInformation: UrlFileInformation): Promise<Readable> {
    const method = 'GET';
    const responseType = 'stream';
    const { url } = fileInformation;
    const { data } = await this.httpService.axiosRef({ url, method, responseType });
    return data;
  }
}
