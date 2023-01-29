import { Injectable, NotFoundException } from '@nestjs/common';
import { ServerRequestContextService } from '@apollo/server/request-context';
import { decode } from 'jsonwebtoken';
import { isEmpty as _isEmpty } from 'lodash';

import { IStorageService } from '../interfaces/storage.interface';

@Injectable()
export class MemoryStorageService implements IStorageService {
  private memoryStorage: {[key: string]: string} = {};

  constructor(private readonly serverRequestContextService: ServerRequestContextService) {}

  async saveItems({ items, dataPartition }: { items: {[key: string]: string}; dataPartition: string; }) {
    const subId = this.getSubId();
    for(const [key, value] of Object.entries(items)) {
      this.upsertItem(key, value, subId, dataPartition);
    }
    return;
  }

  async getItems(keys: Array<string>, dataPartition: string) {
    const subId = this.getSubId();
    const items = Object.assign({}, ...keys.map(key => {
      const dataPartitionKey = `${subId}:${dataPartition}:${key}`;
      const globalKey = `${subId}:${key}`;
      const item = this.memoryStorage[dataPartitionKey] || this.memoryStorage[globalKey];
      return item ? {
        [key]: item
      } : {};
    }));
    if (_isEmpty(items)) {
      throw new NotFoundException('Items not found');
    }
    return items;
  }

  async upsertItem(key: string, value: string, subId: string, dataPartition: string): Promise<void> {
    const mapKey = `${subId}${dataPartition ? ':' + dataPartition : ''}:${key}`;
    this.memoryStorage[mapKey] = value;
  }

  getSubId() {
    const token = this.serverRequestContextService.requesterAccessToken();
    return decode(token).sub as string;
  }
}
