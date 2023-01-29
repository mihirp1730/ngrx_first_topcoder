import { Test, TestingModule } from '@nestjs/testing';
import * as NodeCache from 'node-cache';

import { nodeCacheProvider } from './node-cache.provider';

// TODO: mock the create NodeCache factory
describe('NodeCache', () => {
  let provider: NodeCache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [nodeCacheProvider]
    }).compile();

    provider = module.get<NodeCache>(NodeCache);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
