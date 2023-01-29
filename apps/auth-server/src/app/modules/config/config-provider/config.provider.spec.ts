import { Test, TestingModule } from '@nestjs/testing';

import { configProvider, CONFIG_TOKEN } from './config.provider';
import { Config } from './config.interface';

const mockProcessEnv = {};

describe('configProvider', () => {
  let provider: Config;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        configProvider,
        {
          provide: CONFIG_TOKEN,
          useValue: mockProcessEnv
        }
      ]
    }).compile();

    provider = module.get<Config>(CONFIG_TOKEN);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
