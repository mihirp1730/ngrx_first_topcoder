import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';

import { FileManagerService } from './file-manager.service';

class MockHttp {
  get = jest.fn();
  axiosRef = jest.fn().mockResolvedValue({ contentLength: 5000 });
  head = jest.fn();
}

describe('FileManagerService', () => {
  let service: FileManagerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: HttpService,
          useClass: MockHttp
        },
        {
          provide: FileManagerService.CONSUMER_SUBSCRIPTION_SERVICE_TOKEN,
          useValue: 'http://subscription-api'
        },
        {
          provide: FileManagerService.OSDU_FILE_MANAGER_URL_TOKEN,
          useValue: 'http://osdu-api'
        },
        FileManagerService
      ]
    }).compile();

    service = module.get<FileManagerService>(FileManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFileInformation', () => {
    it('should get the information of the file', async () => {
      const mockSubscription = {
        dataSubscriptionId: 'subscription-id',
        billingAccountId: 'billing-id',
        dataItemId: '123'
      };
      const mockFileName = 'file.zip';
      const mockSignedUrl = 'http://signed-url';
      const mockContentLength = 2000;

      const getDataItemIdSpy = jest.spyOn(service as any, 'getDataItemId').mockReturnValue(mockSubscription.dataItemId);
      const getFileNameSpy = jest.spyOn(service as any, 'getFileName').mockReturnValue(mockFileName);
      const getSignedUrlSpy = jest.spyOn(service as any, 'getSignedUrl').mockReturnValue(mockSignedUrl);
      const getContentLengthSpy = jest.spyOn(service as any, 'getContentLength').mockReturnValue(mockContentLength);

      const result = await service.getFileInformation('token', mockSubscription);

      const expectedHeaders = expect.objectContaining({
        headers: expect.objectContaining({
          authorization: expect.stringContaining('Bearer'),
          billingaccountid: mockSubscription.billingAccountId
        })
      });

      expect(result).toEqual({
        type: 'UrlFileInformation',
        contentLength: mockContentLength,
        filename: mockFileName,
        url: mockSignedUrl
      });
      expect(getDataItemIdSpy).not.toHaveBeenCalled();
      expect(getFileNameSpy).toHaveBeenCalledWith(mockSubscription.dataItemId, expectedHeaders);
      expect(getSignedUrlSpy).toHaveBeenCalledWith(mockSubscription.dataItemId, expectedHeaders);
      expect(getContentLengthSpy).toHaveBeenCalledWith(mockSignedUrl);
    });

    it('should call getDataItemId if no dataItemId is present', async () => {
      const mockSubscription = {
        dataSubscriptionId: 'subscription-id',
        billingAccountId: 'billing-id',
        dataItemId: ''
      };
      const mockFileName = 'file.zip';
      const mockSignedUrl = 'http://signed-url';
      const mockContentLength = 2000;
      const dataItemID = 123;

      const getDataItemIdSpy = jest.spyOn(service as any, 'getDataItemId').mockReturnValue(dataItemID);
      jest.spyOn(service as any, 'getFileName').mockReturnValue(mockFileName);
      jest.spyOn(service as any, 'getSignedUrl').mockReturnValue(mockSignedUrl);
      jest.spyOn(service as any, 'getContentLength').mockReturnValue(mockContentLength);

      await service.getFileInformation('token', mockSubscription);

      expect(getDataItemIdSpy).toHaveBeenCalledWith(
        mockSubscription.dataSubscriptionId,
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: expect.stringContaining('Bearer'),
            billingaccountid: mockSubscription.billingAccountId
          })
        })
      );
    });

    it('should throw an exception if no data item', async () => {
      const mockSubscription = {
        dataSubscriptionId: 'subscription-id',
        billingAccountId: '',
        dataItemId: ''
      };
      const mockValues = {
        [`http://subscription-api/consumer/data-subscriptions/${mockSubscription.dataSubscriptionId}/data-items`]: throwError(
          new HttpException('error', 404)
        )
      };
      jest.spyOn(service.httpService, 'get').mockImplementation((url) => mockValues[url]);

      await expect(service.getFileInformation('token', mockSubscription)).rejects.toThrowError();
    });

    it('should throw an exception if no file name', async () => {
      const mockSubscription = {
        dataSubscriptionId: 'subscription-id',
        billingAccountId: '',
        dataItemId: '123'
      };

      const mockValues = {
        [`http://subscription-api/consumer/data-subscriptions/${mockSubscription.dataSubscriptionId}/data-items`]: of({
          data: { items: [{ dataItemId: mockSubscription.dataItemId }] }
        } as any),
        [`http://osdu-api/file-manager/data-files/${mockSubscription.dataSubscriptionId}`]: throwError(new HttpException('error', 404))
      };
      jest.spyOn(service.httpService, 'get').mockImplementation((url) => mockValues[url]);

      await expect(service.getFileInformation('token', mockSubscription)).rejects.toThrowError();
    });

    it('should throw an exception if no signed url', async () => {
      const mockSubscription = {
        dataSubscriptionId: 'subscription-id',
        billingAccountId: '',
        dataItemId: '123'
      };
      const mockFileName = 'file.zip';

      const mockValues = {
        [`http://subscription-api/consumer/data-subscriptions/${mockSubscription.dataSubscriptionId}/data-items`]: of({
          data: { items: [{ dataItemId: mockSubscription.dataItemId }] }
        } as any),
        [`http://osdu-api/file-manager/data-files/${mockSubscription.dataItemId}`]: of({
          data: { fileName: mockFileName }
        } as any),
        [`http://osdu-api/file-manager/data-files/${mockSubscription.dataItemId}/download`]: throwError(new HttpException('error', 404))
      };
      jest.spyOn(service.httpService, 'get').mockImplementation((url) => mockValues[url]);

      await expect(service.getFileInformation('token', mockSubscription)).rejects.toThrowError();
    });
    it('should throw an exception if no headers', async () => {
      const mockSubscription = {
        dataSubscriptionId: 'subscription-id',
        billingAccountId: '',
        dataItemId: '123'
      };
      const mockFileName = 'file.zip';
      const mockSignedUrl = 'http://signed-url';
      const mockValues = {
        [`http://subscription-api/consumer/data-subscriptions/${mockSubscription.dataSubscriptionId}/data-items`]: of({
          data: { items: [{ dataItemId: mockSubscription.dataItemId }] }
        } as any),
        [`http://osdu-api/file-manager/data-files/${mockSubscription.dataItemId}`]: of({
          data: { fileName: mockFileName }
        } as any),
        [`http://osdu-api/file-manager/data-files/${mockSubscription.dataItemId}/download`]: of({
          data: { signedURL: mockSignedUrl }
        } as any)
      };
      const mockHeadValues = throwError(new HttpException('error', 404));
      jest.spyOn(service.httpService, 'get').mockImplementation((url) => mockValues[url]);
      jest.spyOn(service.httpService, 'head').mockImplementation(() => mockHeadValues);
      await expect((service as any).getContentLength(mockSignedUrl)).rejects.toThrowError();
    });

    it('should throw no exceptions', async () => {
      const mockSubscription = {
        dataSubscriptionId: 'subscription-id',
        billingAccountId: '',
        dataItemId: '123'
      };
      const mockFileName = 'file.zip';
      const mockSignedUrl = 'http://signed-url';
      const mockValues = {
        [`http://subscription-api/consumer/data-subscriptions/${mockSubscription.dataSubscriptionId}/data-items`]: of({
          data: { items: [{ dataItemId: mockSubscription.dataItemId }] }
        } as any),
        [`http://osdu-api/file-manager/data-files/${mockSubscription.dataItemId}`]: of({
          data: { fileName: mockFileName }
        } as any),
        [`http://osdu-api/file-manager/data-files/${mockSubscription.dataItemId}/download`]: of({
          data: { signedURL: mockSignedUrl }
        } as any)
      };
      const mockHeadValues = of({
        headers: { 'content-length': 20000 }
      } as any);

      jest.spyOn(service.httpService, 'get').mockImplementation((url) => mockValues[url]);
      jest.spyOn(service.httpService, 'head').mockImplementation(() => mockHeadValues);
      await expect(service.getFileInformation('token', mockSubscription)).toBeDefined();
    });
  });

  it('should get file stream', () => {
    const urlFileInformation = {
      type: 'UrlFileInformation' as any,
      contentLength: 20000,
      filename: 'test.pdf',
      url: 'randomUrl'
    };

    const mockValues = {
      data: 'some data'
    };

    const mockResponse = {
      toPromise: () => Promise.resolve(mockValues)
    };

    const spy = jest.spyOn(service.httpService, 'axiosRef').mockReturnValue(mockResponse as any);
    service.getFileStreamFromUrl(urlFileInformation);
    expect(spy).toHaveBeenCalled();
  });
});
