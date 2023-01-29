import { IStorageRequest } from '@apollo/api/interfaces';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { MemoryStorageService } from './services/memory-storage.service';

@Controller('store')
export class StorageController {
  constructor(private readonly memoryStorageService: MemoryStorageService) {}

  @Get()
  getItems(@Query('keys') keys: Array<string>, @Query('data-partition') dataPartition: string) {
    if (!(keys instanceof Array)) {
      keys = [keys];
    }
    return this.memoryStorageService.getItems(keys, dataPartition);
  }

  @Post()
  saveItems(@Body() body: IStorageRequest, @Query('data-partition') dataPartition: string) {
    const payload = {
      items: body.items,
      dataPartition: body.includePartition ? dataPartition : null
    };
    return this.memoryStorageService.saveItems(payload);
  }
}
