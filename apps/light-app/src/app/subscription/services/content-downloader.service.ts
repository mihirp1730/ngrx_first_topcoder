import { Injectable } from '@angular/core';
import { ContentService } from '@apollo/app/services/content';
import { NotificationService } from '@apollo/app/ui/notification';

import { SubscriptionService } from './subscription.service';

@Injectable({
  providedIn: 'root'
})
export class ContentDownloaderService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly contentService: ContentService,
    private readonly notificationService: NotificationService
  ) {}

  async download(subscriptionId: string) {
    try {
      this.contentService.downloadSubscriptionContent(
        await this.subscriptionService.getConsumerSubscription(subscriptionId).toPromise(),
        await this.subscriptionService.getConsumerSubscriptionDataItems(subscriptionId).toPromise()
      );
    } catch (error) {
      this.notifyError(error);
    }
  }

  private notifyError(error: any) {
    this.notificationService.send({
      severity: 'Error',
      title: 'Error',
      message: `Something went wrong, please try again later. ${error}`
    });
  }
}
