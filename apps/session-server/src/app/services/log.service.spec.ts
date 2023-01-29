import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { noop } from 'lodash';

import { LogService } from './log.service';

class MockLogger {
  log = noop;
}

describe('LogService', () => {
  let service: LogService;
  let mockLogger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useClass: MockLogger
        },
        LogService
      ]
    }).compile();

    service = module.get(LogService);
    mockLogger = module.get(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should post error', () => {
    return service.postError('', {} as any).then((e) => {
      expect(e).toBeDefined();
    });
  });

  it('should post performance', () => {
    return service.postPerformance('', {} as any).then((e) => {
      expect(e).toBeDefined();
    });
  });
});
