import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DocumentRef } from '@apollo/app/ref';
import { NotificationService } from '@apollo/app/ui/notification';

import { CONTENT_SERVICE_API_URL, ContentService, ContentSubscription } from './app-content.service';

const mockNotificationService = {
  send: jest.fn()
}

const mockDocumentRef = {
  nativeDocument: {
    createElement: jest.fn(),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    }
  }
}

describe('AppContentService', () => {
  let service: ContentService;
  let notificationService: NotificationService;
  let documentRef: DocumentRef;
  const contentServiceUrl = 'http://content-api/api/content';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CONTENT_SERVICE_API_URL,
          useValue: contentServiceUrl
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: DocumentRef,
          useValue: mockDocumentRef
        }
      ]
    });
    service = TestBed.inject(ContentService);
    notificationService = TestBed.inject(NotificationService);
    documentRef = TestBed.inject(DocumentRef);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadDataFiles', () => {

    it('should download all data items in subscription', () => {
      const dataItems = {
        items: [...Array(100).keys()].map(
          (index: number) => ({ dataItemId: `test${index}` }))
      };

      const mockElement = {
        setAttribute: jest.fn()
      };
      jest.spyOn(documentRef.nativeDocument, 'createElement')
        .mockReturnValue(mockElement as any);

      const subscription = {
        dataSubscriptionId: 'test-sub-id',
        billingAccountId: 'test-billing-id',
        dataSubscriptionStatus: 'ACTIVE',
      } as ContentSubscription;

      service.downloadSubscriptionContent(subscription, dataItems);

      expect(documentRef.nativeDocument.createElement).toHaveBeenCalledTimes(dataItems.items.length);
      expect(mockElement.setAttribute).toHaveBeenCalledTimes(dataItems.items.length);
      expect(documentRef.nativeDocument.body.appendChild).toHaveBeenCalledTimes(dataItems.items.length);
      expect(notificationService.send).not.toHaveBeenCalled();
    });

    it('should handle when no data items ids are present', () => {
      const subscription = {
        dataSubscriptionId: 'test-sub-id',
        billingAccountId: 'test-billing-id',
        dataSubscriptionStatus: 'ACTIVE',
      } as ContentSubscription;

      const mockElement = {
        setAttribute: jest.fn()
      };
      jest.spyOn(documentRef.nativeDocument, 'createElement')
        .mockReturnValue(mockElement as any);

      service.downloadSubscriptionContent(subscription, { items: [] });

      expect(documentRef.nativeDocument.createElement).not.toHaveBeenCalled();
      expect(mockElement.setAttribute).not.toHaveBeenCalled();
      expect(documentRef.nativeDocument.body.appendChild).not.toHaveBeenCalled();
      expect(notificationService.send).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'Warning'
      }));
    });

    it('should handle an expired subscription', () => {
      const subscription = {
        dataSubscriptionId: 'test-sub-id',
        billingAccountId: 'test-billing-id',
        dataSubscriptionStatus: 'EXPIRED'
      } as ContentSubscription;

      const mockElement = {
        setAttribute: jest.fn()
      };
      jest.spyOn(documentRef.nativeDocument, 'createElement')
        .mockReturnValue(mockElement as any);

      service.downloadSubscriptionContent(subscription, { items: [] });

      expect(documentRef.nativeDocument.createElement).not.toHaveBeenCalled();
      expect(mockElement.setAttribute).not.toHaveBeenCalled();
      expect(documentRef.nativeDocument.body.appendChild).not.toHaveBeenCalled();
      expect(notificationService.send).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'Error'
      }));
    });

    it('should clean up iframes after file is loaded', fakeAsync(() => {

      const dataItems = {
        items: [...Array(100).keys()].map(
          (index: number) => ({ dataItemId: `test${index}` }))
      };

      const subscription = {
        dataSubscriptionId: 'test-sub-id',
        billingAccountId: 'test-billing-id',
        dataSubscriptionStatus: 'ACTIVE',
      } as ContentSubscription;

      const mockElement = {
        setAttribute: jest.fn()
      };
      jest.spyOn(documentRef.nativeDocument, 'createElement')
        .mockReturnValue(mockElement as any);

      service.downloadSubscriptionContent(subscription, dataItems);

      expect(documentRef.nativeDocument.createElement).toHaveBeenCalledTimes(dataItems.items.length);
      expect(mockElement.setAttribute).toHaveBeenCalledTimes(dataItems.items.length);
      expect(documentRef.nativeDocument.body.appendChild).toHaveBeenCalledTimes(dataItems.items.length);
      expect(notificationService.send).not.toHaveBeenCalled();

      tick(10000);
      expect(documentRef.nativeDocument.body.removeChild).toHaveBeenCalledTimes(dataItems.items.length);
    }));
  });
});
