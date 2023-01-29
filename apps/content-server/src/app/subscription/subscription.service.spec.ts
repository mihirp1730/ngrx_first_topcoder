import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { SubscriptionService } from './subscription.service';

class MockHttp {
  get = jest.fn();
  axiosRef = jest.fn().mockResolvedValue({ contentLength: 5000 });
  head = jest.fn();
}

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HttpService,
          useClass: MockHttp
        },
        {
          provide: SubscriptionService.CONSUMER_SUBSCRIPTION_SERVICE_TOKEN,
          useValue: 'http://subscription-api'
        },
        SubscriptionService
      ]
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSubscriptionById', () => {
    it('should get the subscription information', async () => {
      const id = 'subId_123';
      jest.spyOn(service.httpService, 'get').mockImplementation(() => of({ data: { dataSubscriptionId: id } } as any));

      const res = await service.getSubscriptionById('token', id);
      expect(res.dataSubscriptionId).toBe(id);
    });

    it("should return undefined if API doesn't return info", async () => {
      const id = 'subId_123';
      jest.spyOn(service.httpService, 'get').mockImplementation(() => of(null));

      const res = await service.getSubscriptionById('token', id);
      expect(res).toBeUndefined();
    });
  });

  describe('isSubscriptionExpired', () => {
    it('should return true if subscription is expired', async () => {
      jest.spyOn(service, 'getSubscriptionById').mockReturnValue({ dataSubscriptionStatus: 'EXPIRED' } as any);
      const res = await service.isSubscriptionExpired('token', 'test-id');
      expect(res).toBe(true);
    });

    it('should return false if subscription is expired', async () => {
      jest.spyOn(service, 'getSubscriptionById').mockReturnValue({ dataSubscriptionStatus: 'ACTIVE' } as any);
      const res = await service.isSubscriptionExpired('token', 'test-id');
      expect(res).toBe(false);
    });
  });
});
