import { Component, Input } from '@angular/core';
import { IOpportunityVDR, IAccessDetails } from '@apollo/app/services/opportunity-attendee';

@Component({
  selector: 'apollo-access-status-approved',
  templateUrl: './access-status-approved.component.html',
  styleUrls: ['./access-status-approved.component.scss']
})
export class AccessStatusApprovedComponent {
  @Input() accessType: string;
  @Input() opportunityVdrDetails: IOpportunityVDR;
  @Input() vdrSubscriptionInfo: IAccessDetails;

  launchVDR(url: string) {
    window.open(url, '_blank');
  }
}
