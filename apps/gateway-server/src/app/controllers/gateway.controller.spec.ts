import { Test } from '@nestjs/testing';
import { AppHealthService } from '@apollo/app/health';

import { NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { GatewayService } from '../services/gateway.service';
import { GatewayController } from './gateway.controller';

class MockServerHealthService {
  healthCheck = jest.fn();
}

describe('GatewayController', () => {
  let gatewayController: GatewayController;
  let mockServerHealthService: MockServerHealthService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        GatewayService,
        {
          provide: AppHealthService,
          useClass: MockServerHealthService
        }
      ]
    }).compile();
    gatewayController = app.get<GatewayController>(GatewayController);
    mockServerHealthService = app.get(AppHealthService);
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      mockServerHealthService.healthCheck.mockReturnValue({ statusCode: 200, message: 'OK', error: 'No Error' });
      const res = gatewayController.getHealthCheck('test');

      expect(res).toEqual({ statusCode: 200, message: 'OK', error: 'No Error' });
    });

    it('should raise NotFoundException for health check', async () => {
      mockServerHealthService.healthCheck.mockImplementation(() => {
        throw new NotFoundException({
          statusCode: 404,
          message: 'App Key not found in headers to make call to this /health endpoint',
          error: 'Not Found'
        });
      });

      expect(() => gatewayController.getHealthCheck(null)).toThrow(
        new NotFoundException({
          statusCode: 404,
          message: 'App Key not found in headers to make call to this /health endpoint',
          error: 'Not Found'
        })
      );
    });
  });
});
