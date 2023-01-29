import { Inject, Injectable, InjectionToken } from '@angular/core';
import { DocumentRef } from '@apollo/app/ref';
import { IDataItems, ISubscription, ISubscriptionIdentifier } from '@apollo/app/services/consumer-subscription';
import { NotificationService } from '@apollo/app/ui/notification';

export const CONTENT_SERVICE_API_URL = new InjectionToken<string>('ContentServiceApiUrl');

export type ContentSubscription = Pick<ISubscription,
  'dataSubscriptionId' | 'billingAccountId' | 'dataSubscriptionStatus'>;

type SubscriptionCollocator = Pick<ISubscriptionIdentifier, 'dataSubscriptionId' | 'billingAccountId'>;

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  constructor(
    @Inject(CONTENT_SERVICE_API_URL) private readonly contentApiUrl: string,
    private readonly notificationService: NotificationService,
    private readonly documentRef: DocumentRef
  ) { }

  downloadSubscriptionContent(subscription: ContentSubscription, dataItems: IDataItems) {
    switch (subscription.dataSubscriptionStatus) {
      case 'ACTIVE':
        if (!dataItems.items?.length) {
          this.notifyEmpty();
          break;
        }
        this.downloadContent(subscription, dataItems);
        break;
      case 'EXPIRED':
        this.notifyExpired();
        break;
    }
  }

  private downloadContent(subscription: ContentSubscription, dataItems: IDataItems) {
    const url = `${this.contentApiUrl}/download`;
    const subscriptionIdentifier = {
      dataSubscriptionId: subscription.dataSubscriptionId,
      billingAccountId: subscription.billingAccountId
    };

    dataItems.items
      .forEach(({ dataItemId }) =>
        this.performGetDownload(url, subscriptionIdentifier, dataItemId));
  }

  private performGetDownload(url: string, subscriptionIdentifier: SubscriptionCollocator, dataItemId: string) {
    const frame = this.documentRef.nativeDocument.createElement('iframe');
    frame.setAttribute("src", `${url}/${subscriptionIdentifier.dataSubscriptionId}/${subscriptionIdentifier.billingAccountId}/${dataItemId}`);
    this.documentRef.nativeDocument.body.appendChild(frame);
    setTimeout(() => this.documentRef.nativeDocument.body.removeChild(frame), 10000); // this we should revisit, but it good enough for now
  }

  private notifyEmpty() {
    this.notificationService.send({
      severity: 'Warning',
      title: 'No items to Download',
      message: 'There are no items to download associated with this subscription.'
    });
  }

  private notifyExpired() {
    this.notificationService.send({
      severity: 'Error',
      title: 'Error',
      message: 'The subscription for this data has expired. Please refresh the page to view the updated subscription status.'
    });
  }
}
