import { ISauth } from '@apollo/server/jwt-token-middleware';
import { Interfaces } from '@apollo/server/services';
import { Test, TestingModule } from '@nestjs/testing';
import { noop } from 'lodash';

import { LogService } from '../services/log.service';
import { LogController } from './log.controller';

const session = {
  subid: 'subid-test'
} as ISauth;

class MockLogService {
  postError = noop;
  postPerformance = noop;
}

describe('Log Controller', () => {
  let controller: LogController;
  let mockLogService: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogController],
      providers: [
        {
          provide: LogService,
          useClass: MockLogService
        }
      ]
    }).compile();

    controller = module.get(LogController);
    mockLogService = module.get(LogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw error', async() => {

    const body = {
        message: undefined,
        stack: undefined,
        timestamp: undefined,
        user: undefined
    } as any;

    await expect(controller.postError(session, (body) as Interfaces.Api.Logging.PostErrorRequest)).rejects.toThrow();
  });

  it('should call service', async() => {
    const mockResponse = { error: null } as Interfaces.Api.Logging.PostErrorResponse;

    jest.spyOn(mockLogService, 'postError').mockReturnValue(Promise.resolve(mockResponse));

    const body = {
        message: 'test',
        stack: 'test',
        timestamp: 1200,
        user: session
    } as any;
    const response = await controller.postError(session, (body as Interfaces.Api.Logging.PostErrorRequest));
    
    expect(response).toEqual(mockResponse);
  });

  it('should return error', async() => {

    const body = {
        message: 'test',
        stack: 'test',
        timestamp: 1200,
        user: session
    } as any;
    const mockResponse = { error: 'ERROR' } as Interfaces.Api.Logging.PostErrorResponse;
    jest.spyOn(mockLogService, 'postError').mockReturnValue(Promise.resolve(mockResponse));

    await expect(controller.postError(session, (body) as Interfaces.Api.Logging.PostErrorRequest)).rejects.toThrow();
  });

  it('should throw error', async() => {

    const body = {
        indicator: undefined,
        latency: undefined
    } as any;

    await expect(controller.postPerformance(session, (body) as Interfaces.Api.Logging.PostPerformanceRequest)).rejects.toThrow();
  });

  it('should call service', async() => {
    const mockResponse = { error: null } as Interfaces.Api.Logging.PostPerformanceResponse;

    jest.spyOn(mockLogService, 'postPerformance').mockReturnValue(Promise.resolve(mockResponse));

    const body = {
        performanceIndicator: 'test',
        latency: 1000
    } as any;
    const response = await controller.postPerformance(session, (body as Interfaces.Api.Logging.PostPerformanceRequest));
    
    expect(response).toEqual(mockResponse);
  });

  it('should return error', async() => {

    const body = {
      performanceIndicator: 'test',
        latency: 1000
    } as any;
    const mockResponse = { error: 'ERROR' } as Interfaces.Api.Logging.PostPerformanceResponse;
    jest.spyOn(mockLogService, 'postPerformance').mockReturnValue(Promise.resolve(mockResponse));

    await expect(controller.postPerformance(session, (body) as Interfaces.Api.Logging.PostPerformanceRequest)).rejects.toThrow();
  });

});
