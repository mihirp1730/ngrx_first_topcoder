import { TestBed } from '@angular/core/testing';
import { ContentService } from '@apollo/app/services/content';
import { NotificationService } from '@apollo/app/ui/notification';
import { of, throwError } from 'rxjs';
import { mockContentService, mockNotificationService, mockSubscriptionService } from '../../shared/services.mock';
import { ContentDownloaderService } from './content-downloader.service';
import { SubscriptionService } from './subscription.service';

describe('ContentDownloaderService', () => {
  let service: ContentDownloaderService;
  let subscriptionService: SubscriptionService;
  let contentService: ContentService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: SubscriptionService,
          useValue: mockSubscriptionService
        },
        {
          provide: ContentService,
          useValue: mockContentService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    service = TestBed.inject(ContentDownloaderService);
    subscriptionService = TestBed.inject(SubscriptionService);
    contentService = TestBed.inject(ContentService);
    notificationService = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should download all files in subscription', async () => {
    const subscription = {
      dataSubscriptionId: 'test-sub-id',
      billingAccountId: 'test-billing-id',
      dataSubscriptionStatus: 'ACTIVE'
    };
    const dataItems = [];

    jest.spyOn(subscriptionService, 'getConsumerSubscription').mockReturnValue(of(subscription as any));
    jest.spyOn(subscriptionService, 'getConsumerSubscriptionDataItems').mockReturnValue(of(dataItems as any));

    await service.download(subscription.dataSubscriptionId);

    expect(subscriptionService.getConsumerSubscription).toHaveBeenCalled();
    expect(subscriptionService.getConsumerSubscriptionDataItems).toHaveBeenCalled();
    expect(contentService.downloadSubscriptionContent).toHaveBeenCalledWith(subscription, dataItems);
    expect(notificationService.send).not.toHaveBeenCalled();
  });

  it('should handle and notify of error thrown', async () => {
    const subscription = {
      dataSubscriptionId: 'test-sub-id',
      billingAccountId: 'test-billing-id',
      dataSubscriptionStatus: 'ACTIVE'
    };

    jest.spyOn(subscriptionService, 'getConsumerSubscription').mockReturnValue(of(subscription as any));
    jest.spyOn(subscriptionService, 'getConsumerSubscriptionDataItems').mockImplementation(() => throwError('fake failure'));

    jest.spyOn(contentService, 'downloadSubscriptionContent');

    await service.download(subscription.dataSubscriptionId);

    expect(subscriptionService.getConsumerSubscription).toHaveBeenCalled();
    expect(subscriptionService.getConsumerSubscriptionDataItems).toHaveBeenCalled();
    expect(contentService.downloadSubscriptionContent).not.toHaveBeenCalled();
    expect(notificationService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'Error'
      })
    );
  });
});
