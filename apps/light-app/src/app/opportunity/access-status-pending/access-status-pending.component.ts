import { Component, Input } from '@angular/core';
import { IOpportunityRequest } from '@apollo/app/services/opportunity-attendee';

@Component({
  selector: 'apollo-access-status-pending',
  templateUrl: './access-status-pending.component.html',
  styleUrls: ['./access-status-pending.component.scss']
})
export class AccessStatusPendingComponent {
  @Input() accessType: string;
  @Input() vdrRequestInfo: IOpportunityRequest;
}
