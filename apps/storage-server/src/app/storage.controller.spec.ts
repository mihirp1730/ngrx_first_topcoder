import { Test, TestingModule } from '@nestjs/testing';

import { MemoryStorageService } from './services/memory-storage.service';
import { StorageController } from './storage.controller';

class MockMemoryStorageService {
  getItems = jest.fn();
  saveItems = jest.fn();
}

describe('StorageController', () => {
  let app: TestingModule;
  let storageController: StorageController;
  let mockMemoryStorageService: MemoryStorageService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: MemoryStorageService,
          useClass: MockMemoryStorageService
        }
      ]
    }).compile();
    storageController = app.get(StorageController);
    mockMemoryStorageService = app.get(MemoryStorageService);
  });

  describe('getItems', () => {
    it('should return saved items with one key passed', async () => {
      const savedItems = {
        'test-key': 'test-value'
      };
      const keys = 'test-key';
      const dataPartition = 'test-partition';
      const getItemsSpy = jest.spyOn(mockMemoryStorageService, 'getItems').mockReturnValue(Promise.resolve(savedItems));
      const result = await storageController.getItems(keys as any, dataPartition);
      expect(getItemsSpy).toBeCalledWith([keys], dataPartition);
      expect(result).toEqual(savedItems);
    });

    it('should return saved items with multiplr keys passed', async () => {
      const savedItems = {
        'test-key': 'test-value',
        'test-key2': 'test-value'
      };
      const keys = ['test-key', 'test-key-2'];
      const dataPartition = 'test-partition';
      const getItemsSpy = jest.spyOn(mockMemoryStorageService, 'getItems').mockReturnValue(Promise.resolve(savedItems));
      const result = await storageController.getItems(keys, dataPartition);
      expect(getItemsSpy).toBeCalledWith(keys, dataPartition);
      expect(result).toEqual(savedItems);
    });
  });

  describe('setItems', () => {
    it('should send items to save into service with data partition', async () => {
      const dataPartition = 'test-partition';
      const requestBody = {
        items: {
          'test-key': 'test-value'
        },
        includePartition: true
      };
      const payload = {
        items: requestBody.items,
        dataPartition: dataPartition
      };
      const saveItemsSpy = jest.spyOn(mockMemoryStorageService, 'saveItems');
      await storageController.saveItems(requestBody, dataPartition);
      expect(saveItemsSpy).toBeCalledWith(payload);
    });

    it('should send items to save into service without data partition', async () => {
      const dataPartition = 'test-partition';
      const requestBody = {
        items: {
          'test-key': 'test-value'
        },
        includePartition: false
      };
      const payload = {
        items: requestBody.items,
        dataPartition: null
      };
      const saveItemsSpy = jest.spyOn(mockMemoryStorageService, 'saveItems');
      await storageController.saveItems(requestBody, dataPartition);
      expect(saveItemsSpy).toBeCalledWith(payload);
    });
  });
});
