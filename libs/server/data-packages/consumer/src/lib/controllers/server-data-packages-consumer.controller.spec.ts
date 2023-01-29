import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { noop } from 'lodash';
import { v4 as uuid } from 'uuid';

import { ServerDataPackagesConsumerService } from '../services/server-data-packages-consumer.service';
import { ServerDataPackagesConsumerController } from './server-data-packages-consumer.controller';

class MockServerDataPackagesConsumerService {
  getDataPackage = noop
}

describe('ServerDataPackagesConsumerController', () => {
  let controller: ServerDataPackagesConsumerController;
  let mockServerDataPackagesConsumerService: ServerDataPackagesConsumerController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ServerDataPackagesConsumerService,
          useClass: MockServerDataPackagesConsumerService
        }
      ],
      controllers: [ServerDataPackagesConsumerController]
    }).compile();

    controller = module.get(ServerDataPackagesConsumerController);
    mockServerDataPackagesConsumerService = module.get(ServerDataPackagesConsumerService);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  describe('getDataPackage', () => {
    it('should return ServerDataPackagesConsumerService\'s getDataPackage response', async () => {
      const dataPackageId = uuid();
      const response = uuid();
      const spy = jest.spyOn(mockServerDataPackagesConsumerService, 'getDataPackage').mockReturnValue(Promise.resolve(response as any));
      const result = await controller.getDataPackage(dataPackageId);
      expect(spy).toHaveBeenCalledWith(dataPackageId);
      expect(result).toBe(response);
    });
    it('should return HttpException errors', async () => {
      const dataPackageId = { } as any;
      const httpExceptionMessage = uuid();
      const httpException = new HttpException(httpExceptionMessage, HttpStatus.INTERNAL_SERVER_ERROR);
      jest.spyOn(mockServerDataPackagesConsumerService, 'getDataPackage').mockReturnValue(Promise.reject(httpException));
      await expect(controller.getDataPackage(dataPackageId)).rejects.toThrow(httpExceptionMessage);
    });
    it('should return a default error', async () => {
      const dataPackageId = { } as any;
      const httpExceptionMessage = uuid();
      const httpException = new Error(httpExceptionMessage);
      jest.spyOn(mockServerDataPackagesConsumerService, 'getDataPackage').mockReturnValue(Promise.reject(httpException));
      await expect(controller.getDataPackage(dataPackageId)).rejects.toThrow('An unknown error occurred.');
    });
  });

});
