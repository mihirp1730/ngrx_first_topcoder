import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IOpportunitiesDetails } from '@apollo/app/services/opportunity-attendee';
import * as moment from 'moment';

const NO_VALUE_ALT_TEXT = 'Not available';

@Component({
  selector: 'apollo-opportunity-dashboard-card',
  templateUrl: './opportunity-dashboard-card.component.html',
  styleUrls: ['./opportunity-dashboard-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityDashboardCardComponent {
  private _opportunityDetails: IOpportunitiesDetails;

  get opportunityDetails() {
    return this._opportunityDetails;
  }

  @Input() set opportunityDetails(value: IOpportunitiesDetails) {
    this._opportunityDetails = value;
    this.duration = this.getDuration(this.opportunityDetails);
  }

  public imgPlaceHolderSrc = 'assets/images/no-image-placeholder.png';
  public duration: number | string;
  public noValueAltText = NO_VALUE_ALT_TEXT;

  public getDuration(opportunityDetails: IOpportunitiesDetails) {
    if (opportunityDetails.opportunityProfile) {
      const startDate = moment(opportunityDetails.opportunityProfile.offerStartDate);
      const endDate = moment(opportunityDetails.opportunityProfile.offerEndDate);
      const diffInDays = endDate.diff(startDate, 'days');
      return diffInDays;
    }
    return NO_VALUE_ALT_TEXT;
  }
}
