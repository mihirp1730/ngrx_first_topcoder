import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import {
  accessLevelsName,
  IOpportunityRequest,
  opportunityRequestStatus,
  OpportunityStatus
} from '@apollo/app/services/opportunity-attendee';
import { IVendorProfile } from '@apollo/app/vendor';

@Component({
  selector: 'apollo-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss']
})
export class RequestsComponent implements OnChanges, OnInit {
  @Input() opportunityRequestDetails: IOpportunityRequest;
  readonly accessLevelsNameEnum = accessLevelsName;
  readonly opportunityRequestStatusEnum = opportunityRequestStatus;

  readonly opportunityStatusEnum = OpportunityStatus;
  signedUrl: string;

  constructor(private mediaDownloadService: MediaDownloadService) {}

  ngOnInit() {
    this.downloadLogoSrc(this.opportunityRequestDetails?.vendorProfile);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.opportunityRequestDetails) {
      const levels = this.opportunityRequestDetails.accessLevels.map((value) => {
        if (value.toLowerCase().search('confidential') > -1) {
          value = this.accessLevelsNameEnum.CI;
        }
        return value;
      });
      this.opportunityRequestDetails = { ...this.opportunityRequestDetails, accessLevels: levels.sort() };
    }
  }

  isOpportunityDisabled(): boolean {
    return (
      this.opportunityRequestDetails?.opportunityStatus?.toUpperCase() === OpportunityStatus.Expired.toUpperCase() ||
      this.opportunityRequestDetails?.opportunityStatus?.toUpperCase() === OpportunityStatus.Unpublished.toUpperCase()
    );
  }

  downloadLogoSrc(vendorProfile: IVendorProfile) {
    this.mediaDownloadService.downloadLogoImageSrc(vendorProfile).subscribe((signedUrl: string) => {
      this.signedUrl = signedUrl;
    });
  }
}
