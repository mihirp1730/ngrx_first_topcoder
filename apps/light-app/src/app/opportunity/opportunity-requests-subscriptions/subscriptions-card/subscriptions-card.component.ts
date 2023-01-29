import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ConsumerSubscriptionService } from '@apollo/app/services/consumer-subscription';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import {
  accessLevelsName,
  IAccessDetails,
  IOpportunitySubscription,
  OpportunityStatus,
  opportunitySubscriptionStatus
} from '@apollo/app/services/opportunity-attendee';
import { IVendorProfile } from '@apollo/app/vendor';
import { orderBy } from 'lodash';

@Component({
  selector: 'apollo-subscriptions-card',
  templateUrl: './subscriptions-card.component.html',
  styleUrls: ['./subscriptions-card.component.scss']
})
export class SubscriptionsComponent implements OnChanges, OnInit {
  @Input() opportunitySubscriptionDetails: IOpportunitySubscription;
  readonly accessLevelsNameEnum = accessLevelsName;
  readonly opportunitySubscriptionStatusEnum = opportunitySubscriptionStatus;
  readonly opportunityStatusEnum = OpportunityStatus;

  signedUrl: string;

  constructor(public consumerSubscriptionService: ConsumerSubscriptionService, private mediaDownloadService: MediaDownloadService) {}

  ngOnInit() {
    this.downloadLogoSrc(this.opportunitySubscriptionDetails?.vendorProfile);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.opportunitySubscriptionDetails) {
      let notAvailableDetail = [...this.opportunitySubscriptionDetails.accessDetails];
      let accessLevelName: string;
      const isVDRAvailable = this.opportunitySubscriptionDetails.accessDetails.filter(
        (value: IAccessDetails) => value.accessLevel.search('VDR') > -1
      );
      const isCIAvailable = this.opportunitySubscriptionDetails.accessDetails.filter(
        (value: IAccessDetails) => value.accessLevel.search('CONFIDENTIAL_INFORMATION') > -1
      );
      if (isVDRAvailable.length === 0 || isCIAvailable.length === 0) {
        if (isVDRAvailable.length === 0) {
          accessLevelName = this.accessLevelsNameEnum.VDR;
        }
        if (isCIAvailable.length === 0) {
          accessLevelName = this.accessLevelsNameEnum.CI;
        }
        notAvailableDetail.push({
          startDate: '',
          endDate: '',
          accessLevel: accessLevelName,
          status: this.opportunitySubscriptionStatusEnum.NotAvailable
        });
        notAvailableDetail = orderBy(notAvailableDetail, ['accessLevel']);
      }
      this.opportunitySubscriptionDetails = {
        ...this.opportunitySubscriptionDetails,
        accessDetails: notAvailableDetail
      };
    }
  }

  isOpportunityDisabled(): boolean {
    return (
      this.opportunitySubscriptionDetails?.opportunityStatus?.toUpperCase() === OpportunityStatus.Expired.toUpperCase() ||
      this.opportunitySubscriptionDetails?.opportunityStatus?.toUpperCase() === OpportunityStatus.Unpublished.toUpperCase()
    );
  }

  viewDetailsPage(opportunityId) {
    const OpportunityURL = this.consumerSubscriptionService.getOpportunityConsumerUrl(opportunityId);
    window.open(OpportunityURL, '_blank');
  }

  downloadLogoSrc(vendorProfile: IVendorProfile) {
    this.mediaDownloadService.downloadLogoImageSrc(vendorProfile).subscribe((signedUrl: string) => {
      this.signedUrl = signedUrl;
    });
  }
}
