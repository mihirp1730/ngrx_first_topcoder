import { TestBed } from '@angular/core/testing';

import { mockDataPackagesService, mockConsumerSubscriptionService } from '../../shared/services.mock';
import { ConsumerSubscriptionService } from '@apollo/app/services/consumer-subscription';
import { SubscriptionService } from './subscription.service';
import { DataPackagesService } from '@apollo/app/services/data-packages';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let consumerSubscriptionService: ConsumerSubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: DataPackagesService,
          useValue: mockDataPackagesService
        },
        {
          provide: ConsumerSubscriptionService,
          useValue: mockConsumerSubscriptionService
        }
      ]
    });
    service = TestBed.inject(SubscriptionService);
    consumerSubscriptionService = TestBed.inject(ConsumerSubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get Consumer Subscription', () => {
    const subscriptionId = 'sub_1234';
    service.getConsumerSubscription(subscriptionId);
    expect(consumerSubscriptionService.getConsumerSubscription).toHaveBeenCalled();
  });
});
