import { Test } from '@nestjs/testing';
import { noop } from 'lodash';
import { v4 as uuid } from 'uuid';

import { BaseConsumerDataSource } from '../providers/consumer-data-source';
import { ServerDataPackagesConsumerService } from './server-data-packages-consumer.service';

class MockBaseConsumerDataSource {
  queryDataPackageSubscription = noop
}

describe('ServerDataPackagesConsumerService', () => {
  let mockBaseConsumerDataSource: BaseConsumerDataSource;
  let service: ServerDataPackagesConsumerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: BaseConsumerDataSource,
          useClass: MockBaseConsumerDataSource
        },
        ServerDataPackagesConsumerService
      ]
    }).compile();

    service = module.get(ServerDataPackagesConsumerService);
    mockBaseConsumerDataSource = module.get(BaseConsumerDataSource);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  describe('getDataPackage', () => {
    it('should use the subscription data from the consumer service', async () => {
      const dataPackageId = uuid();
      const response = uuid();
      const spy = jest.spyOn(mockBaseConsumerDataSource, 'queryDataPackageSubscription').mockReturnValue(Promise.resolve(response as any));
      const { subscription } = await service.getDataPackage(dataPackageId)
      expect(spy).toHaveBeenCalledWith(dataPackageId);
      expect(subscription).toBe(response);
    });
  });

});
