import { ServerRequestContextService } from '@apollo/server/request-context';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MemoryStorageService } from './memory-storage.service';

class MockServerRequestContextService {
  requesterAccessToken = jest
    .fn()
    .mockReturnValue(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    );
}

describe('MemoryStorageService', () => {
  let service: MemoryStorageService;
  let mockServerRequestContextService: ServerRequestContextService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        MemoryStorageService,
        {
          provide: ServerRequestContextService,
          useClass: MockServerRequestContextService
        }
      ]
    }).compile();

    service = app.get<MemoryStorageService>(MemoryStorageService);
    mockServerRequestContextService = app.get(ServerRequestContextService);
  });

  describe('saveItems', () => {
    it('should upsert each item', async () => {
      const payload = {
        items: {
          'test-item-1': 'test value',
          'test-item-2': 'test value'
        },
        dataPartition: 'test-data-partition'
      };
      const subId = '1234567890';
      const getSubIdSpy = jest.spyOn(service, 'getSubId').mockReturnValue(subId);
      const upsertItemSpy = jest.spyOn(service, 'upsertItem').mockImplementation();
      await service.saveItems(payload);
      expect(getSubIdSpy).toBeCalled();
      expect(upsertItemSpy).toHaveBeenCalledTimes(2);
      expect(upsertItemSpy.mock.calls).toEqual([
        ['test-item-1', 'test value', subId, payload.dataPartition],
        ['test-item-2', 'test value', subId, payload.dataPartition]
      ]);
    });
  });

  describe('getItems', () => {
    const dataPartition = 'test-data-partition';
    const subId = '1234567890';
    let getSubIdSpy;

    beforeEach(function () {
      (service as any).memoryStorage = {
        [`${subId}:${dataPartition}:test-item-1`]: 'test value',
        [`${subId}:test-item-1`]: 'test global value',
        [`${subId}:test-item-2`]: 'test value 2'
      };
      getSubIdSpy = jest.spyOn(service, 'getSubId').mockReturnValue(subId);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should return found items by priority', async () => {
      const keys = ['test-item-1', 'test-item-2'];
      const result = await service.getItems(keys, dataPartition);
      expect(result).toEqual({
        'test-item-1': 'test value',
        'test-item-2': 'test value 2'
      });
      expect(getSubIdSpy).toBeCalled();
    });

    it('should return only found items', async () => {
      const keys = ['test-item-2', 'test-item-3'];
      const result = await service.getItems(keys, dataPartition);
      expect(result).toEqual({
        'test-item-2': 'test value 2'
      });
    });

    it('should return an exception if not items found', async () => {
      const keys = ['test-item-3'];
      try {
        await service.getItems(keys, dataPartition);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('Items not found');
      }
    });
  });

  describe('upsertItem', () => {
    it('should save item with data partition', async () => {
      const key = 'test-item-1';
      const value = 'test value';
      const subId = '1234567890';
      const dataPartition = 'test-data-partition';
      const itemKey = `${subId}:${dataPartition}:${key}`;
      await service.upsertItem(key, value, subId, dataPartition);
      expect((service as any).memoryStorage[itemKey]).toBeDefined();
    });

    it('should save item without data partition', async () => {
      const key = 'test-item-1';
      const value = 'test value';
      const subId = '1234567890';
      const itemKey = `${subId}:${key}`;
      await service.upsertItem(key, value, subId, null);
      expect((service as any).memoryStorage[itemKey]).toBeDefined();
    });
  });

  describe('getSubId', () => {
    it('should return the token subId', () => {
      const requesterAccessTokenSpy = jest.spyOn(mockServerRequestContextService, 'requesterAccessToken');
      const subId = service.getSubId();
      expect(requesterAccessTokenSpy).toBeCalled();
      expect(subId).toEqual('1234567890');
    });
  });
});
