import { AppHealthService } from '@apollo/app/health';
import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as express from 'express';
import { Readable } from 'stream';

import { AppController } from './app.controller';
import { FileManagerService } from './file-manager/file-manager.service';
import { SubscriptionService } from './subscription/subscription.service';

class MockFileManagerService {
  getFileInformation = jest.fn();
  getContentLength = jest.fn();
  getFileStreamFromUrl = jest.fn();
}
class MockServerHealthService {
  healthCheck = jest.fn();
}

class MockSubscriptionService {
  getSubscriptionById = jest.fn();
  isSubscriptionExpired = jest.fn();
}

class MockHttpService {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
  delete = jest.fn();
  toPromise = jest.fn();
}

describe('AppController', () => {
  let app: TestingModule;
  let controller: AppController;
  let mockServerHealthService: MockServerHealthService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: FileManagerService,
          useClass: MockFileManagerService
        },
        {
          provide: SubscriptionService,
          useClass: MockSubscriptionService
        },
        {
          provide: HttpService,
          useClass: MockHttpService
        },
        {
          provide: AppHealthService,
          useClass: MockServerHealthService
        }
      ]
    }).compile();

    controller = app.get(AppController);
    mockServerHealthService = app.get(AppHealthService);
  });

  const prepareMocks = (requiredResponse: string): [express.Response, jest.SpyInstance, jest.SpyInstance] => {
    jest.spyOn(JwtTokenMiddleware, 'getToken').mockReturnValue('abcd');

    jest.spyOn(controller.subscriptionService, 'isSubscriptionExpired').mockReturnValue(Promise.resolve(false));

    const resMock = {
      status: null,
      json: '',
      setHeader: jest.fn(),
      on: jest.fn().mockImplementation((method, callback) => {
        if (method === requiredResponse) {
          callback();
        }
      })
    } as unknown as express.Response;

    const spyInfo = jest.spyOn(controller.fileManagerService, 'getFileInformation').mockReturnValue({
      type: 'UrlFileInformation',
      contentLength: '1000',
      filename: 'test.zip'
    } as any);

    const spyStream = jest.spyOn(controller.fileManagerService, 'getFileStreamFromUrl').mockReturnValue(
      Promise.resolve({
        pipe: () => {
          resMock;
        }
      } as unknown as Readable)
    );

    return [resMock, spyInfo, spyStream];
  };

  const prepareMocksOppoAttendee = (requiredResponse: string): [express.Response, jest.SpyInstance, jest.SpyInstance] => {
    const resMock = {
      status: null,
      json: '',
      setHeader: jest.fn(),
      on: jest.fn().mockImplementation((method, callback) => {
        if (method === requiredResponse) {
          callback();
        }
      })
    } as unknown as express.Response;

    const spyOppoAttendeeInfo = jest.spyOn(controller.fileManagerService, 'getContentLength').mockReturnValue({
      type: 'UrlFileInformation',
      contentLength: '1000',
      filename: 'test2.zip'
    } as any);

    const spyStream = jest.spyOn(controller.fileManagerService, 'getFileStreamFromUrl').mockReturnValue(
      Promise.resolve({
        pipe: () => {
          resMock;
        }
      } as unknown as Readable)
    );

    return [resMock, spyOppoAttendeeInfo, spyStream];
  };

  it('should create', () => {
    expect(controller).toBeTruthy();
  });

  describe('ContentServer', () => {
    describe('get', () => {
      it('should return a promise with the response', async () => {
        const request = {} as any;
        const [resMock, spyInfo, spyStream] = prepareMocks('finish');

        const payload = {
          dataSubscriptionId: 'test',
          billingAccountId: 'test',
          dataItemId: 'test'
        };

        await controller.get(request, payload.dataSubscriptionId, payload.billingAccountId, payload.dataItemId, resMock);
        expect(spyInfo).toHaveBeenCalled();
        expect(spyStream).toHaveBeenCalled();
      });

      it('should return a rejected promise', async () => {
        const request = {} as any;
        const [resMock, spyInfo, spyStream] = prepareMocks('error');

        try {
          const payload = {
            dataSubscriptionId: 'test',
            billingAccountId: 'test',
            dataItemId: 'test'
          };

          await controller.get(request, payload.dataSubscriptionId, payload.billingAccountId, payload.dataItemId, resMock);
        } catch (err) {
          expect(err).toEqual('An error occurred providing the file...');
          expect(spyInfo).toHaveBeenCalled();
          expect(spyStream).toHaveBeenCalled();
        }
      });

      it('should return an expired subscription error', async () => {
        const request = {} as any;
        const response = {} as any;

        jest.spyOn(JwtTokenMiddleware, 'getToken').mockReturnValue('abcd');
        jest.spyOn(controller.subscriptionService, 'isSubscriptionExpired').mockReturnValue(Promise.resolve(true));

        const payload = {
          dataSubscriptionId: 'test',
          billingAccountId: 'test',
          dataItemId: 'test'
        };
        await expect(
          controller.get(request, payload.dataSubscriptionId, payload.billingAccountId, payload.dataItemId, response)
        ).rejects.toThrowError();
      });
    });

    describe('getDownload', () => {
      it('should return a promise with the response', async () => {
        const [resMock, spyOppoAttendeeInfo, spyStream] = prepareMocksOppoAttendee('finish');

        const payload = {
          fileName: 'test-file-name',
          signedUrl: 'https://signed-url'
        };

        await controller.getDownload(payload.fileName, payload.signedUrl, resMock);
        expect(spyOppoAttendeeInfo).toHaveBeenCalled();
        expect(spyStream).toHaveBeenCalled();
      });

      it('should return a rejected promise', async () => {
        const [resMock, spyOppoAttendeeInfo, spyStream] = prepareMocksOppoAttendee('error');

        try {
          const payload = {
            fileName: 'test-file-name',
            signedUrl: 'https://signed-url'
          };

          await controller.getDownload(payload.fileName, payload.signedUrl, resMock);
        } catch (err) {
          expect(err).toEqual('An error occurred providing the file...');
          expect(spyOppoAttendeeInfo).toHaveBeenCalled();
          expect(spyStream).toHaveBeenCalled();
        }
      });
    });

    describe('Health Check', () => {
      it('should perform health check successfully', async () => {
        mockServerHealthService.healthCheck.mockReturnValue({ statusCode: 200, message: 'OK', error: 'No Error' });
        const res = controller.getHealthCheck('test');

        expect(res).toEqual({ statusCode: 200, message: 'OK', error: 'No Error' });
      });

      it('should raise NotFoundException for health check', async () => {
        mockServerHealthService.healthCheck.mockImplementation(() => {
          throw new NotFoundException({
            statusCode: 404,
            message: 'App Key not found in headers to make call to this /health endpoint',
            error: 'Not Found'
          });
        });

        expect(() => controller.getHealthCheck(null)).toThrow(
          new NotFoundException({
            statusCode: 404,
            message: 'App Key not found in headers to make call to this /health endpoint',
            error: 'Not Found'
          })
        );
      });
    });
  });
});
