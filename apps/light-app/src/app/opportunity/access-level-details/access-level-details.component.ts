import { Component, Input, OnInit } from '@angular/core';
import {
  accessLevelsName,
  IAccessDetails,
  IOpportunityRequest,
  IOpportunityVDR,
  opportunityRequestStatus,
  opportunitySubscriptionStatus
} from '@apollo/app/services/opportunity-attendee';
import { Store } from '@ngrx/store';
import { take, tap } from 'rxjs';

import * as opportunityAttendeeSelector from '../state/selectors/opportunity-attendee.selectors';

@Component({
  selector: 'apollo-access-level-details',
  templateUrl: './access-level-details.component.html',
  styleUrls: ['./access-level-details.component.scss']
})
export class AccessLevelDetailsComponent implements OnInit {
  readonly pending = opportunityRequestStatus.Pending;
  readonly approved = opportunitySubscriptionStatus.Approved;
  readonly vdr = accessLevelsName.VDR;
  pendingStatus: string;
  approvedStatus: string;
  vdrRequestInfo: IOpportunityRequest;
  vdrSubscriptionInfo: IAccessDetails;
  opportunityVdrDetails: IOpportunityVDR;
  @Input() selectedOpportunityId: string;

  constructor(public readonly store: Store) {}

  ngOnInit(): void {
    this.store
      .select(opportunityAttendeeSelector.selectOpportunityVDR({ opportunityId: this.selectedOpportunityId }))
      .pipe(
        tap((opportunityVDR) => {
          this.opportunityVdrDetails = opportunityVDR;
        }),
        take(1)
      )
      .subscribe();
    this.store
      .select(opportunityAttendeeSelector.selectOpportunityVDRRequests({ opportunityId: this.selectedOpportunityId }))
      .pipe(
        tap((opportunityVDRRequests) => {
          this.pendingStatus = opportunityVDRRequests?.[0]?.requestStatus;
          this.vdrRequestInfo = opportunityVDRRequests?.[0];
        }),
        take(1)
      )
      .subscribe();

    this.store
      .select(opportunityAttendeeSelector.selectOpportunityVDRSubscription({ opportunityId: this.selectedOpportunityId }))
      .pipe(
        tap((opportunityVDRSubscription) => {
          const accessDetail = opportunityVDRSubscription?.[0]?.accessDetails.filter((accessDetail) => {
            return accessDetail.status === this.approved && accessDetail.accessLevel === 'VDR';
          });
          this.approvedStatus = accessDetail?.[0]?.status;
          this.vdrSubscriptionInfo = accessDetail?.[0];
        }),
        take(1)
      )
      .subscribe();
  }
}
